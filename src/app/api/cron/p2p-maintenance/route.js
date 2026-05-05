import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import {
  cleanupExpiredMatches,
  autoDisputeStaleMatches,
  nudgeStaleWithdrawers,
} from '@/lib/p2p-maintenance';

/**
 * P2P Maintenance Cron Job
 *
 * Schedule: Every 15 minutes
 * Secured by: secret query parameter matching CRON_SECRET env var
 *
 * Actions performed:
 *   1. cleanupExpiredMatches()     — Cancel matches past 60-min TTL
 *   2. nudgeStaleWithdrawers(3)    — Send SMS reminder at 3-hour mark
 *   3. autoDisputeStaleMatches(6)  — Escalate to 'disputed' at 6-hour mark
 */
export async function GET(request) {
  try {
    // Security: Verify cron secret via query params (matching project pattern)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (!secret || secret !== process.env.CRON_SECRET) {
      console.warn('P2P Cron: Unauthorized request attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const startTime = Date.now();
    console.log('🕐 P2P Maintenance Cron: Starting...');

    // Run all three maintenance tasks in parallel.
    // Each function in p2p-maintenance has its own try/catch and returns a result object.
    const [expiredResult, nudgeResult, disputeResult] = await Promise.all([
      cleanupExpiredMatches(),        // Release expired locks (60-min TTL)
      nudgeStaleWithdrawers(3),       // SMS warning at 3-hour mark
      autoDisputeStaleMatches(6),     // Auto-dispute at 6-hour mark
    ]);

    const elapsed = Date.now() - startTime;
    console.log(`✅ P2P Maintenance Cron: Completed in ${elapsed}ms`, {
      expired: expiredResult?.count ?? 0,
      nudged: nudgeResult?.nudged ?? 0,
      disputed: disputeResult?.disputed ?? 0,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      elapsed_ms: elapsed,
      results: {
        expired_matches_cleared: expiredResult?.count ?? 0,
        withdrawers_nudged: nudgeResult?.nudged ?? 0,
        matches_disputed: disputeResult?.disputed ?? 0,
      },
    });

  } catch (error) {
    console.error('❌ P2P Maintenance Cron Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
