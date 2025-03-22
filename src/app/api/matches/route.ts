export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Player } from '@/models/Player';
import { Match } from '@/models/Match';

export async function GET() {
  try {
    await connectDB();
    const matches = await Match.find()
      .populate({
        path: 'player1',
        select: 'name position isActive'
      })
      .populate({
        path: 'player2',
        select: 'name position isActive'
      })
      .populate({
        path: 'winner',
        select: 'name position isActive'
      })
      .sort({ round: 1, createdAt: 1 });
    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في جلب المباريات' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { player1Id, player2Id, round } = await request.json();

    // التحقق من وجود مباراة مسبقة بين نفس اللاعبين في نفس الجولة
    const existingMatch = await Match.findOne({
      round,
      $or: [
        { player1: player1Id, player2: player2Id },
        { player1: player2Id, player2: player1Id }
      ]
    });

    if (existingMatch) {
      return NextResponse.json(
        { error: 'توجد مباراة مسبقة بين هذين اللاعبين في هذه الجولة' },
        { status: 400 }
      );
    }

    const match = new Match({
      player1: player1Id,
      player2: player2Id,
      round,
      winner: null
    });

    await match.save();
    const populatedMatch = await Match.findById(match._id)
      .populate({
        path: 'player1',
        select: 'name position isActive'
      })
      .populate({
        path: 'player2',
        select: 'name position isActive'
      });

    return NextResponse.json(populatedMatch);
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المباراة' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { matchId, winnerId } = await request.json();

    const match = await Match.findById(matchId);
    if (!match) {
      return NextResponse.json(
        { error: 'المباراة غير موجودة' },
        { status: 404 }
      );
    }

    // التحقق من أن الفائز هو أحد اللاعبين في المباراة
    if (winnerId && winnerId !== match.player1.toString() && winnerId !== match.player2.toString()) {
      return NextResponse.json(
        { error: 'الفائز يجب أن يكون أحد اللاعبين في المباراة' },
        { status: 400 }
      );
    }

    match.winner = winnerId;
    await match.save();

    const updatedMatch = await Match.findById(matchId)
      .populate({
        path: 'player1',
        select: 'name position isActive'
      })
      .populate({
        path: 'player2',
        select: 'name position isActive'
      })
      .populate({
        path: 'winner',
        select: 'name position isActive'
      });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث المباراة' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('id');

    if (!matchId) {
      return NextResponse.json(
        { error: 'معرف المباراة مطلوب' },
        { status: 400 }
      );
    }

    const match = await Match.findByIdAndDelete(matchId);
    if (!match) {
      return NextResponse.json(
        { error: 'المباراة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'تم حذف المباراة بنجاح' });
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ في حذف المباراة' },
      { status: 500 }
    );
  }
}
