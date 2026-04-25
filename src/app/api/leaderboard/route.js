import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // Fetch top 10 wallets by total cash earned
    const topWallets = await Wallet.find({})
      .sort({ totalCashEarned: -1 })
      .limit(10)
      .populate('user', 'fullName avatar createdAt');

    // If no wallets or few data, combine with dummy data for a "populated" look
    const dummyMiners = [
      { name: 'Arjun K.', earnings: 45200, gold: 12.45, rank: 1, joinDate: 'Jan 2026' },
      { name: 'Priya S.', earnings: 38450, gold: 10.22, rank: 2, joinDate: 'Feb 2026' },
      { name: 'Rohan M.', earnings: 32100, gold: 8.55, rank: 3, joinDate: 'Dec 2025' },
      { name: 'Sanya V.', earnings: 28900, gold: 7.12, rank: 4, joinDate: 'Mar 2026' },
      { name: 'Vikram R.', earnings: 24500, gold: 6.88, rank: 5, joinDate: 'Jan 2026' },
      { name: 'Anita D.', earnings: 21200, gold: 5.44, rank: 6, joinDate: 'Feb 2026' },
      { name: 'Rahul G.', earnings: 18900, gold: 4.90, rank: 7, joinDate: 'Apr 2026' },
      { name: 'Sneha P.', earnings: 15600, gold: 4.12, rank: 8, joinDate: 'Mar 2026' },
      { name: 'Karan B.', earnings: 12400, gold: 3.20, rank: 9, joinDate: 'May 2026' },
      { name: 'Manoj T.', earnings: 9800, gold: 2.55, rank: 10, joinDate: 'Jun 2026' },
    ];

    const realMiners = topWallets
      .filter(w => w.user && w.user.fullName)
      .map((w, index) => ({
        name: w.user.fullName.split(' ')[0] + ' ' + (w.user.fullName.split(' ')[1]?.[0] || '') + '.',
        earnings: w.totalCashEarned,
        gold: w.totalGoldEarned,
        rank: index + 1,
        joinDate: new Date(w.user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        isReal: true
      }));

    // Merge logic: If we have real data, use it. If not enough, fill with dummies
    const miners = realMiners.length >= 10 
      ? realMiners 
      : [...realMiners, ...dummyMiners.slice(realMiners.length)];

    return NextResponse.json({ miners });
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
