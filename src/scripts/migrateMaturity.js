const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// We need to define or import the model
const walletSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  cashBalance: Number,
  totalCashEarned: Number,
  pendingMaturityValue: Number
});
const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);

async function runMigrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Starting migration...');
    const wallets = await Wallet.find({ pendingMaturityValue: { $gt: 0 } });
    
    console.log(`Found ${wallets.length} wallets to migrate.`);
    
    for (const wallet of wallets) {
      const amount = wallet.pendingMaturityValue || 0;
      console.log(`User: ${wallet.user} | Amount: ₹${amount}`);
      
      await Wallet.updateOne(
        { _id: wallet._id },
        { 
          $inc: { 
            cashBalance: amount, 
            totalCashEarned: amount 
          },
          $set: { pendingMaturityValue: 0 }
        }
      );
    }
    
    console.log('Migration successfully completed.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigrate();
