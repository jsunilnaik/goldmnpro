import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://jsn:p2290oQqMbXrHnwg@yuiwer.vhn0bli.mongodb.net/goldmine-pro';

async function testConnection() {
  const client = new MongoClient(MONGODB_URI);
  try {
    console.log('🔌 Testing connection...');
    await client.connect();
    console.log('✅ Connection successful!');
    const db = client.db('goldmine-pro');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.close();
  }
}

testConnection();
