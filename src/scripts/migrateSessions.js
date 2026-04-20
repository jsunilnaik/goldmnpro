const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Minimal Schema
const planSchema = new mongoose.Schema({ dailySessionLimit: Number });
const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

const subSchema = new mongoose.Schema({ 
  status: String, 
  totalSessionsExpected: Number,
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  duration: Number // backup
});
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subSchema);

async function runMigrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 1. Update all Plans
    console.log('Updating all Plans to 1 session/day...');
    const planUpdate = await Plan.updateMany({}, { $set: { dailySessionLimit: 1 } });
    console.log(`Updated ${planUpdate.modifiedCount} plans.`);
    
    // 2. Update existing active Subscriptions
    console.log('Updating active Subscriptions rewards scale...');
    const activeSubs = await Subscription.find({ status: 'active' }).populate('plan');
    
    let count = 0;
    for (const sub of activeSubs) {
      // Calculate reward based on total duration (1 session/day)
      const newExpected = sub.plan?.duration || 30; 
      
      if (sub.totalSessionsExpected !== newExpected) {
        sub.totalSessionsExpected = newExpected;
        await sub.save();
        count++;
      }
    }
    
    console.log(`Adjusted ${count} active subscriptions to the single-session reward scale.`);
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigrate();
