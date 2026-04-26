export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import CityUpiRule from '@/models/CityUpiRule';

export async function GET() {
  try {
    const admin = await requireAdmin();
    await connectDB();
    
    // Lazy-import User to avoid circular issues
    const User = (await import('@/models/User')).default;

    const rules = await CityUpiRule.find().sort({ updatedAt: -1 }).lean();

    // Enrich each rule with the live user count and detailed distribution for that city
    const enriched = await Promise.all(rules.map(async (rule) => {
      // Get all active users in this city
      const users = await User.find({ city: rule.city, role: 'user' }).select('paymentMethods').lean();
      
      const userCount = users.length;
      
      // Calculate how many users each UPI in the pool has
      const distribution = rule.upis.map(upi => {
        const assignedCount = users.filter(u => 
          u.paymentMethods?.some(pm => pm.type === 'upi' && pm.isPrimary && pm.upiId === upi)
        ).length;
        return { upi, count: assignedCount };
      });

      return { 
        ...rule, 
        _userCount: userCount,
        _distribution: distribution 
      };
    }));

    return NextResponse.json({ rules: enriched });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: error.message.includes('Forbidden') ? 403 : 401 });
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const { city, upis, isActive } = await request.json();

    if (!city || !upis || !Array.isArray(upis) || upis.length === 0) {
      return NextResponse.json({ message: 'City and a non-empty UPI list are required' }, { status: 400 });
    }

    const rule = await CityUpiRule.findOneAndUpdate(
      { city: city.trim() },
      { 
        upis: upis.map(u => u.trim()).filter(Boolean), 
        isActive: isActive !== undefined ? isActive : true,
        updatedBy: admin._id
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'City UPI rule updated successfully', rule });
  } catch (error) {
    console.error('City UPI Rule Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Rule ID is required' }, { status: 400 });
    }

    await CityUpiRule.findByIdAndDelete(id);
    return NextResponse.json({ message: 'City UPI rule deleted successfully' });
  } catch (error) {
    console.error('City UPI Delete Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
