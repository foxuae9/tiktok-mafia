export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Player } from '@/models/Player';

export async function GET() {
  try {
    await connectDB();
    const count = await Player.countDocuments();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    );
  }
}
