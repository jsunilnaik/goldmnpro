// Direct MongoDB seed script — inserts Indian/Karnataka reviews
// Run: node --experimental-vm-modules scripts/seed-reviews.mjs

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://jsn:p2290oQqMbXrHnwg@yuiwer.vhn0bli.mongodb.net/goldmine-pro';

// 15 organic Indian/Karnataka reviews with realistic human mistakes
const reviews = [
  {
    title: "Mast App hai bhai! Paise aa rahe hai daily 🙌",
    description: "Maine pehle socha ye sab fraud hoga, but mera bhai ne bola try karo. Abhi 3 hafte ho gaye aur ₹8,400 withdraw kar chuka hun. Bangalore mein rehta hun, UPI se turant aa gaya paise. Sach bolun toh bahut acha hai ye app.",
    screenshotUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
    date: new Date("2026-04-01T08:30:00Z"),
  },
  {
    title: "Super app, Mysuru se review de raha hun",
    description: "Hallo friends, main Mysore se hun. Is app se mujhe acha earning mil rahi he. Silver plan liya tha 2 mahine pehle, ab tak ₹22,000 se jyada withdraw kar chuka. Meri wife bhi is app use kar rahi he aur unhe bhi bahut acha lag raha. Genuinely good app, koi fraud nahi.",
    screenshotUrl: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&q=80",
    date: new Date("2026-04-03T09:00:00Z"),
  },
  {
    title: "Bahut acha app hai! Karnataka ka best earning app",
    description: "Namaskara! Main Hubli se hun. Yeh app try kiya tha doubt se but abhi mera earning ₹500-600 roz ho raha hai. Gold Mining simple hai, koi technical knowledge nahi chahiye. Mere dost ko bhi refer kiya, uska bhi chalu ho gaya. Withdrawal bhi instant aya mere GPay mein.",
    screenshotUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
    date: new Date("2026-04-04T10:15:00Z"),
  },
  {
    title: "Real app hai, fraud nahi — Bengaluru se",
    description: "Nanu Bengaluru nalli idhini. This app is 100% real. Maine 45 din mein ₹18,900 earn kiya. Pehle ek chota plan se shuru kiya, phir silver upgrade kiya. Customer support bhi badi help karti hai WhatsApp pe. Sab log jo soch rahe hain ye fake hai, ek baar try karo phir dekhte hain.",
    screenshotUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
    date: new Date("2026-04-05T07:45:00Z"),
  },
  {
    title: "Paise kamana itna easy nahi tha kabhi bhi!",
    description: "Delhi se Bangalore aaya tha kaam ke liye, yahan ek colleague ne GoldMine bataya. Ek mahine mein ₹11,500 mila mujhe. App simple hai, phone se hi sab hota hai. Withdrawal mein thoda time laga pehili baar but dusree baar instant tha. Overall bohot satisfied hun.",
    screenshotUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&q=80",
    date: new Date("2026-04-06T11:20:00Z"),
  },
  {
    title: "Gulbarga se hun, mast income hai is app se",
    description: "Kalaburagi (Gulbarga) se hun bhai. Yahan earning ke opportunities kam hai toh ek friend ne ye app suggest kiya tha. Pehle ₹1,500 invest kiya Bronze plan mein. 30 din mein ₹3,000 se jyada aya. Ab Silver plan mein hun. Is app ne meri bahut help ki sach mein.",
    screenshotUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&q=80",
    date: new Date("2026-04-07T13:00:00Z"),
  },
  {
    title: "Tumkur wale bhi earning kar rahe hai GoldMine se 💰",
    description: "Mere gaon mein network thoda slow hai but app bahut smooth chalta hai. Subah uthke mining start karta hun, raat tak paisa jama hota hai. Abhi tak ₹6,200 nikaala. Wife ko bhi account banaya uske liye. Dono mila ke accha income ho raha hai. Karnataka ka best investment app hai ye.",
    screenshotUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=80",
    date: new Date("2026-04-08T08:05:00Z"),
  },
  {
    title: "Sach Mein Paise Aate Hain — Verified by me Ravi",
    description: "Maine bohot apps try kiye the jisme se sab fraud nikle. GoldMine ek aisi app hai jisme actually paise milte hain. Mangalore se hun, local mein iske baare mein kaafi log jaante hain. 2 months mein ₹24,000 kamaya. Screenshot mein proof bhi hai. 100% recommend karta hun.",
    screenshotUrl: "https://images.unsplash.com/photo-1642790551116-18e150f248e3?w=400&q=80",
    date: new Date("2026-04-09T15:30:00Z"),
  },
  {
    title: "Ghar baithe paise — Dharwad ki Sunanda",
    description: "GruhiNi hun main, ghar se bahar nahi jaati. Ye app ne mujhe apna income diya. Husband ne download karaya, phir mujhe sikhaya. Ab main khud se mining chalu karti hun aur apne kharche ke liye paise nikalti hun. ₹9,800 nikaale abhi tak 6 hafte mein. Bahut khushi hai mujhe.",
    screenshotUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80",
    date: new Date("2026-04-10T09:55:00Z"),
  },
  {
    title: "Student hun — part time income ke liye perfect",
    description: "VTU mein padhta hun. Fees ke liye extra paise chahiye the. Friend ne GoldMine suggest kiya. Campus se hi use karta hun. Pichle 5 hafte mein ₹7,200 kama liya. College canteen ka kharch nikal aata hai easily. Sab students ko ye jaroor try karna chahiye.",
    screenshotUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80",
    date: new Date("2026-04-11T16:00:00Z"),
  },
  {
    title: "Shimoga se — App Bahut Badiya Hai Bhai!",
    description: "Naanu Shivamogga ninda barutheeni. Ye app ne mera life thoda change kiya. Seedha baat karta hun — 3 mahine, ₹31,000 plus withdraw. Silver plan best hai mere liye. Mining rate fast hai, paise bhi time pe aate hain. Meri amma ko bhi account banaya unhone bhi use chalu kiya.",
    screenshotUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80",
    date: new Date("2026-04-12T12:10:00Z"),
  },
  {
    title: "Real Proof — Hassan, Karnataka",
    description: "Main Hassan jile se hun. Is app ke baare mein YouTube pe dekha tha phir try kiya. Seedha Silver plan liya kyunki review padhke confidence tha. 40 din mein ₹5,000 target se zyada aya. Bas mining on rakhna hai, sab automatic hota hai. Bahut khush hun is app se.",
    screenshotUrl: "https://images.unsplash.com/photo-1611532736573-418856b9870c?w=400&q=80",
    date: new Date("2026-04-13T10:30:00Z"),
  },
  {
    title: "Ballari wala review — sach mein kaam karta hai ye",
    description: "Yaar sach bolun toh pehle 1 hafte mujhe doubt tha ki paise aayenge ya nahi. Lekin jab pehla withdrawal aya ₹2,100 ka to dil khush ho gaya. Abhi Silver plan mein hun ek mahine se. Total ₹13,400 mila hai. Daily 2 sessions karta hun app mein. 100% genuine hai koi doubt nahi.",
    screenshotUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&q=80",
    date: new Date("2026-04-14T07:00:00Z"),
  },
  {
    title: "Udupi wala review — Ek Number App Hai Yeh!",
    description: "Coastal Karnataka se hun. Fishing business ke saath saath ye app bhi chalata hun. Subah 5 baje mining start karta hun, evening tak paise count karta hun 😄 Teen mahine mein ₹28,000 nikala. UPI direct account mein aata hai. Koi chakkar nahi, simple earnings. Highly recommended!",
    screenshotUrl: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&q=80",
    date: new Date("2026-04-15T06:30:00Z"),
  },
  {
    title: "Chikkamagaluru se — Coffee ke saath Mining!",
    description: "Chikmagalur mein coffee estate hai humara. Subah coffee pite pite mining on karta hun 😂 Bahut mazedaar lagta hai jab paise badhte hain screen pe. 2 mahine mein ₹16,200 withdraw kiya. Seasonal work hoti hai yahaan toh extra income bahut helpful hai. Shukriya GoldMine team!",
    screenshotUrl: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
    date: new Date("2026-04-15T17:45:00Z"),
  },
];

async function seedReviews() {
  const client = new MongoClient(MONGODB_URI);
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const db = client.db('goldmine-pro');
    const collection = db.collection('reviews');

    console.log('🗑  Clearing existing reviews...');
    const deleted = await collection.deleteMany({});
    console.log(`   Removed ${deleted.deletedCount} old reviews.`);

    console.log('\n🌱 Inserting Indian/Karnataka reviews...');
    const result = await collection.insertMany(reviews.map(r => ({
      ...r,
      createdAt: r.date,
      updatedAt: r.date,
    })));

    console.log(`\n✅ Inserted ${result.insertedCount} reviews successfully!\n`);

    reviews.forEach((r, i) => {
      console.log(`  ${String(i + 1).padStart(2, '0')}. ${r.title}`);
    });

  } catch (err) {
    console.error('\n❌ Error seeding reviews:', err.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed.');
  }
}

seedReviews();
