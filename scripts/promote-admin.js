const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('node:dns');

// Force Google DNS for Atlas SRV records
dns.setServers(['8.8.8.8']);

// Load env from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function promoteAdmin(email) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️ User ${user.fullName} is already an Admin.`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();
    console.log(`🚀 Successfully promoted ${user.fullName} to Admin!`);
    console.log('Please refresh your dashboard to see the Admin tabs.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during promotion:', err);
    process.exit(1);
  }
}

// Get email from command line or default to your email
const email = process.argv[2] || 'jsunilnaik93533@gmail.com';
promoteAdmin(email);
