const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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
  role: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, 'fullName email role').lean();
    console.log('\n--- User List ---');
    users.forEach(u => {
      console.log(`${u.fullName} (${u.email}) - Role: ${u.role}`);
    });
    console.log('-----------------\n');

    const admins = users.filter(u => u.role === 'admin');
    if (admins.length === 0) {
      console.log('WARNING: No admin users found in the database.');
    } else {
      console.log(`Found ${admins.length} admin(s).`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();
