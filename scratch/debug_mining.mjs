import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  email: String,
  fullName: String,
}, { collection: 'users' });

const miningSessionSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  status: String,
  startedAt: Date,
  subscription: mongoose.Schema.Types.ObjectId,
}, { collection: 'miningsessions' });

const subscriptionSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  plan: mongoose.Schema.Types.ObjectId,
  status: String,
}, { collection: 'subscriptions' });

async function debug() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const User = mongoose.model('User', userSchema);
  const MiningSession = mongoose.model('MiningSession', miningSessionSchema);
  const Subscription = mongoose.model('Subscription', subscriptionSchema);

  const user = await User.findOne({ email: 'jsunilnaik94533@gmail.com' });
  if (!user) {
    console.log('User not found');
    return;
  }
  console.log('User:', user._id, user.fullName);

  const session = await MiningSession.findOne({ user: user._id, status: 'active' });
  console.log('Active Session:', JSON.stringify(session, null, 2));

  if (session) {
    const sub = await Subscription.findById(session.subscription);
    console.log('Subscription:', JSON.stringify(sub, null, 2));
  }

  process.exit(0);
}

debug().catch(err => {
  console.error(err);
  process.exit(1);
});
