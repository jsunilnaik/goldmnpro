import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from 'mongoose';
import Review from '../src/models/Review.js';
import Plan from '../src/models/Plan.js';

const URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(URI);
  console.log('Connected to MongoDB');

  // Check existing plans
  const existingPlans = await Plan.find({});
  console.log('Existing plans:', existingPlans.map(p => `${p.name} (₹${p.price})`).join(', '));

  // Add 3 reviews
  const reviews = [
    {
      title: 'Amazing Mining Returns!',
      description: 'I started with the Bronze plan and within 30 days, I earned back my full investment plus extra. The mining process is smooth and automated. Highly recommend GoldMine Pro to anyone looking for passive income!',
      screenshotUrl: 'https://placehold.co/800x500/1a1a2e/d4af37?text=5+Star+Review&font=raleway',
    },
    {
      title: 'Best Referral Program Ever',
      description: 'The multi-level referral system is incredible. I referred just 5 friends and I am earning commissions from their entire network. Already made over ₹15,000 in referral bonuses alone. This platform is a game changer!',
      screenshotUrl: 'https://placehold.co/800x500/1a1a2e/22c55e?text=Referral+Earnings&font=raleway',
    },
    {
      title: 'Smooth Withdrawals, No Hassle',
      description: 'What I love most about GoldMine Pro is how easy and fast the withdrawals are. The P2P system works perfectly and I receive my money directly to my UPI within minutes. Trustworthy platform with great support.',
      screenshotUrl: 'https://placehold.co/800x500/1a1a2e/3b82f6?text=Fast+Withdrawals&font=raleway',
    }
  ];

  for (const review of reviews) {
    const r = await Review.create(review);
    console.log('Added review:', r.title);
  }

  // Add a new plan (Platinum tier)
  // First update the schema enum to include Platinum
  const newPlan = {
    name: 'Platinum',
    slug: 'platinum',
    price: 25000,
    originalPrice: 30000,
    duration: 30,
    miningRate: 125,
    maxDailyMiningHours: 24,
    dailySessionLimit: 1,
    maxSessionMinutes: 8,
    totalSessionsLimit: 30,
    goldPerPoint: 0.00005,
    estimatedMonthlyReturn: 50000,
    referralBonus: 8,
    icon: '💎',
    color: '#a78bfa',
    isActive: true,
    isPopular: false,
    sortOrder: 5,
  };

  const plan = await Plan.create(newPlan);
  console.log('Added plan:', plan.name, '- ₹' + plan.price);

  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
