export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Player } from '@/models/Player';
import { Match } from '@/models/Match';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // التحقق من وجود مباريات للاعب
    const matches = await Match.find({
      $or: [
        { player1: params.id },
        { player2: params.id }
      ]
    });

    if (matches.length > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف اللاعب لأنه مشارك في مباريات' },
        { status: 400 }
      );
    }

    // حذف اللاعب
    const player = await Player.findByIdAndDelete(params.id);
    if (!player) {
      return NextResponse.json(
        { error: 'اللاعب غير موجود' },
        { status: 404 }
      );
    }

    // تحديث مواقع اللاعبين الآخرين
    await Player.updateMany(
      { position: { $gt: player.position } },
      { $inc: { position: -1 } }
    );

    return NextResponse.json({ message: 'تم حذف اللاعب بنجاح' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف اللاعب' },
      { status: 500 }
    );
  }
}
