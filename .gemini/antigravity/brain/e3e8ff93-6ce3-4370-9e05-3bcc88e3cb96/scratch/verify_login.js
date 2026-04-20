const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve('d:/POD Project/GoldMine Pro/v1/goldmine-pro-nextjs/.env.local') });

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const alice = await User.findOne({ email: 'alice@test.com' });
    
    if (!alice) {
      console.log('❌ Alice not found');
    } else {
      console.log('✅ Alice found');
      console.log('Hash:', alice.password);
      const isMatch = await bcrypt.compare('password123', alice.password);
      console.log('Password Match:', isMatch);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
verify();
