import mongoose from 'mongoose';
import connectDB from './src/lib/mongodb.js';
import PaymentMatch from './src/models/PaymentMatch.js';
import User from './src/models/User.js';
import Subscription from './src/models/Subscription.js';
import Withdrawal from './src/models/Withdrawal.js';

async function checkMatches() {
  await connectDB();
  
  console.log('--- Payment Matches ---');
  const matches = await PaymentMatch.find().sort({ createdAt: -1 }).limit(10);
  console.log(`Found ${matches.length} recent matches.`);
  
  matches.forEach(m => {
    console.log(`ID: ${m._id}, Status: ${m.status}, Amount: ${m.amount}, Sub: ${m.subscription}, Created: ${m.createdAt}`);
  });

  const paidMatches = await PaymentMatch.countDocuments({ status: 'paid' });
  console.log(`Total 'paid' matches: ${paidMatches}`);

  const matchedMatches = await PaymentMatch.countDocuments({ status: 'matched' });
  console.log(`Total 'matched' matches: ${matchedMatches}`);

  process.exit(0);
}

checkMatches().catch(err => {
  console.error(err);
  process.exit(1);
});
