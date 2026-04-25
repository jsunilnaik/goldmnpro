const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://jsn:p2290oQqMbXrHnwg@yuiwer.vhn0bli.mongodb.net/goldmine-pro';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    const PaymentMatch = mongoose.model('PaymentMatch', new mongoose.Schema({}, { strict: false }));
    
    const stats = await PaymentMatch.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('Match counts by status:');
    console.log(JSON.stringify(stats, null, 2));
    
    const recentPaid = await PaymentMatch.find({ status: 'paid' }).sort({ updatedAt: -1 }).limit(5);
    console.log('\nRecent 5 PAID matches:');
    recentPaid.forEach(m => {
      console.log(`- ID: ${m._id}, Proof: ${m.proof ? 'Yes' : 'No'}, Screenshot: ${m.proof?.screenshot ? 'Yes (Length: ' + m.proof.screenshot.length + ')' : 'No'}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
