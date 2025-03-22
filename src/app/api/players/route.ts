export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Player } from '@/models/Player';
import { Match } from '@/models/Match';

export async function GET() {
  try {
    await connectDB();
    console.log('Fetching players...'); // للتأكد من الوصول للدالة
    const players = await Player.find().sort({ position: 1 });
    console.log('Players found:', players); // للتأكد من البيانات
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error); // للتأكد من الأخطاء
    return NextResponse.json(
      { error: 'حدث خطأ في جلب اللاعبين' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name } = await request.json();

    // التحقق من وجود اللاعب
    const existingPlayer = await Player.findOne({ name });
    if (existingPlayer) {
      return NextResponse.json(
        { error: 'يوجد لاعب بهذا الاسم بالفعل' },
        { status: 400 }
      );
    }

    // الحصول على آخر موقع
    const lastPlayer = await Player.findOne().sort({ position: -1 });
    const position = lastPlayer ? lastPlayer.position + 1 : 1;

    const player = new Player({
      name,
      position,
      isActive: true, // تأكد من أن اللاعب نشط عند إنشائه
    });

    await player.save();
    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ في إضافة اللاعب' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');

    if (!playerId) {
      return NextResponse.json(
        { error: 'معرف اللاعب مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود مباريات للاعب
    const match = await Match.findOne({
      $or: [
        { player1: playerId },
        { player2: playerId }
      ]
    });

    if (match) {
      return NextResponse.json(
        { error: 'لا يمكن حذف اللاعب لأنه مشارك في مباريات' },
        { status: 400 }
      );
    }

    const player = await Player.findByIdAndDelete(playerId);
    if (!player) {
      return NextResponse.json(
        { error: 'اللاعب غير موجود' },
        { status: 404 }
      );
    }

    // إعادة ترتيب المواقع
    await Player.updateMany(
      { position: { $gt: player.position } },
      { $inc: { position: -1 } }
    );

    return NextResponse.json({ message: 'تم حذف اللاعب بنجاح' });
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ في حذف اللاعب' },
      { status: 500 }
    );
  }
}
