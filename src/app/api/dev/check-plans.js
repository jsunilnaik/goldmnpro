const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const main = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const Plan = mongoose.models.Plan || mongoose.model('Plan', new mongoose.Schema({ price: Number, name: String }));
        const plans = await Plan.find({ isActive: true });
        console.log('Active Plans:', JSON.stringify(plans, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

main();
