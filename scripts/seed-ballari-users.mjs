import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

// User Schema (Simplified for seeding)
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  password: { type: String, default: 'password123' },
  city: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  paymentMethods: [{
    type: { type: String, enum: ['upi', 'bank_account'] },
    upiId: String,
    isPrimary: Boolean,
    isVerified: Boolean
  }]
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedBallariUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const city = 'Ballari';
    const count = 185;
    const users = [];

    console.log(`Creating ${count} test users for ${city}...`);

    for (let i = 1; i <= count; i++) {
      // Generate unique data
      const suffix = Math.random().toString(36).substring(2, 7);
      const phoneSuffix = Math.floor(100000 + Math.random() * 900000);
      
      users.push({
        fullName: `Ballari Tester ${i}`,
        email: `tester_${i}_${suffix}@example.com`,
        phone: `99${i.toString().padStart(3, '0')}${phoneSuffix}`.substring(0, 10),
        city: city,
        role: 'user',
        isActive: true,
        paymentMethods: [{
          type: 'upi',
          upiId: `old_upi_${i}@ybl`, // Start with some "old" UPI
          isPrimary: true,
          isVerified: true
        }]
      });
    }

    // Insert in batches of 50 to be safe
    const batchSize = 50;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await User.insertMany(batch);
      console.log(`Inserted batch ${i / batchSize + 1}...`);
    }

    console.log(`✅ Success! Added ${count} users to ${city}.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedBallariUsers();
