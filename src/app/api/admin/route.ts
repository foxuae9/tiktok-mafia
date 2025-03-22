export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Player } from '@/models/Player';

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { playerId } = await request.json();
    await Player.findByIdAndDelete(playerId);
    return NextResponse.json({ message: 'تم حذف اللاعب بنجاح' });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في حذف اللاعب' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { matchId, winnerId } = await request.json();
    
    // تحديث نتيجة المباراة
    const players = await Player.find({
      'matchups._id': matchId
    });
    
    for (const player of players) {
      const matchup = player.matchups.find(m => m._id.toString() === matchId);
      if (matchup) {
        matchup.winner = winnerId;
        await player.save();
      }
    }
    
    return NextResponse.json({ message: 'تم تحديث النتيجة بنجاح' });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في تحديث النتيجة' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { action } = await request.json();
    
    if (action === 'reset') {
      // إعادة تعيين البطولة
      await Player.updateMany({}, {
        $set: { matchups: [], isActive: true }
      });
      return NextResponse.json({ message: 'تم إعادة تعيين البطولة بنجاح' });
    }
    
    if (action === 'start') {
      // بدء البطولة وإنشاء المباريات الأولى
      const players = await Player.find({ isActive: true }).sort({ position: 1 });
      const matches = [];
      
      for (let i = 0; i < players.length; i += 2) {
        if (i + 1 < players.length) {
          const match = {
            round: 1,
            opponent: players[i + 1]._id,
            winner: null
          };
          
          players[i].matchups.push(match);
          players[i + 1].matchups.push({
            ...match,
            opponent: players[i]._id
          });
          
          await players[i].save();
          await players[i + 1].save();
        }
      }
      
      return NextResponse.json({ message: 'تم بدء البطولة بنجاح' });
    }
    
    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في تنفيذ الإجراء' }, { status: 500 });
  }
}
