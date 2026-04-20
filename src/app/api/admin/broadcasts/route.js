import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Broadcast from '@/models/Broadcast';
import { requireAuth } from '@/lib/auth';

// Admin Auth check helper
async function checkAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}

export async function GET(request) {
  try {
    await checkAdmin();
    await connectDB();
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
    return NextResponse.json({ broadcasts });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: error.message.includes('Admin') ? 403 : 500 });
  }
}

export async function POST(request) {
  try {
    await checkAdmin();
    const body = await request.json();
    await connectDB();
    
    const broadcast = await Broadcast.create(body);
    return NextResponse.json({ message: 'Broadcast created successfully', broadcast }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await checkAdmin();
    const body = await request.json();
    const { id, ...updateData } = body;
    await connectDB();
    
    const broadcast = await Broadcast.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ message: 'Broadcast updated successfully', broadcast });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await checkAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await connectDB();
    
    await Broadcast.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Broadcast deleted' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
