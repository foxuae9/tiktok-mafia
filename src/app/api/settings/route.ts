export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

// تعريف نموذج الإعدادات
const settingsSchema = new mongoose.Schema({
  registrationOpen: {
    type: Boolean,
    default: true,
  },
});

// إنشاء أو الحصول على النموذج
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne({});
    
    if (!settings) {
      settings = await Settings.create({ registrationOpen: true });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { action } = await request.json();

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings();
    }

    settings.registrationOpen = action === 'open';
    await settings.save();

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الإعدادات' },
      { status: 500 }
    );
  }
}
