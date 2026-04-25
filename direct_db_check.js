const mongoose = require('mongoose');

// Define Schemas directly to avoid alias issues
const PaymentMatchSchema = new mongoose.Schema({
  status: String,
  subscription: mongoose.Schema.Types.ObjectId,
  subscriber: mongoose.Schema.Types.ObjectId,
  withdrawer: mongoose.Schema.Types.ObjectId,
  amount: Number,
  proof: Object,
  createdAt: Date
}, { collection: 'paymentmatches' });

async function check() {
  await mongoose.connect('mongodb+srv://jsn:p2290oQqMbXrHnwg@yuiwer.vhn0bli.mongodb.net/goldmine-pro');
  const PaymentMatch = mongoose.model('PaymentMatch', PaymentMatchSchema);
  
  const total = await PaymentMatch.countDocuments();
  console.log('Total PaymentMatch records:', total);
  
  const paid = await PaymentMatch.countDocuments({ status: 'paid' });
  console.log('Paid PaymentMatch records:', paid);
  
  const matched = await PaymentMatch.countDocuments({ status: 'matched' });
  console.log('Matched PaymentMatch records:', matched);
  
  const recent = await PaymentMatch.find().sort({ createdAt: -1 }).limit(5);
  console.log('Recent 5 matches:');
  recent.forEach(r => console.log(`- ID: ${r._id}, Status: ${r.status}, Sub: ${r.subscription}, Amount: ${r.amount}`));
  
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
