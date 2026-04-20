import connectDB from './mongodb';
import PaymentMatch from '@/models/PaymentMatch';
import Withdrawal from '@/models/Withdrawal';
import Subscription from '@/models/Subscription';

/**
 * Finds expired P2P matches and reverts them to free up liquidity.
 * Duration: 60 minutes.
 */
export async function cleanupExpiredMatches() {
  try {
    await connectDB();
    
    // Find matches that are in 'matched' status and past their expiration
    // (A match that is 'paid' should NOT expire automatically as it has user money involved)
    const now = new Date();
    const expiredMatches = await PaymentMatch.find({
      status: 'matched',
      expiresAt: { $lt: now }
    });

    if (expiredMatches.length === 0) return { count: 0 };

    let revertedCount = 0;
    for (const match of expiredMatches) {
      // 1. Mark match as cancelled
      match.status = 'cancelled';
      match.adminNotes = 'System Auto-Cancel: Match timed out after 60 mins without payment.';
      await match.save();

      // 2. Revert the Withdrawal status and lockedAmount
      const withdrawal = await Withdrawal.findById(match.withdrawal);
      if (withdrawal) {
        // Decrement lockedAmount (ensure it doesn't go below 0)
        withdrawal.lockedAmount = Math.max(0, (withdrawal.lockedAmount || 0) - match.amount);
        
        // If it was processing (fully matched), bring it back to approved if it now has space
        if (withdrawal.status === 'processing') {
          withdrawal.status = 'approved';
        }
        await withdrawal.save();
      }

      // 3. Revert the Subscription status back to 'pending'?
      // Actually, if a sub was in 'pending_verification' (matched), 
      // with no proof, it should go back to 'pending'.
      const subscription = await Subscription.findById(match.subscription);
      if (subscription && subscription.status === 'pending_verification') {
        subscription.status = 'pending';
        await subscription.save();
      }
      
      revertedCount++;
    }

    console.log(`🧹 P2P Maintenance: Reverted ${revertedCount} expired matches.`);
    return { count: revertedCount };
  } catch (error) {
    console.error('P2P Maintenance Error:', error);
    return { error: error.message };
  }
}
