export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { Match } from '@/models/Match';
import { Player } from '@/models/Player';

// تعريف نموذج الإعدادات
const settingsSchema = new mongoose.Schema({
  registrationOpen: {
    type: Boolean,
    default: true
  }
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne() || await Settings.create({ registrationOpen: true });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في جلب إعدادات البطولة' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { action } = await request.json();

    let settings = await Settings.findOne() || new Settings({ registrationOpen: true });

    if (action === 'closeRegistration') {
      settings.registrationOpen = false;
      await settings.save();
    } else if (action === 'endMatch') {
      // إنشاء المباريات للجولة التالية
      const Match = mongoose.models.Match;
      const currentRound = await Match.distinct('round');
      const maxRound = Math.max(...currentRound);
      
      const matches = await Match.find({ round: maxRound })
        .populate('player1')
        .populate('player2');

      const winners = matches.filter(m => m.winner).map(m => m.winner);
      
      // إنشاء المباريات الجديدة
      for (let i = 0; i < winners.length; i += 2) {
        if (winners[i] && winners[i + 1]) {
          await Match.create({
            player1: winners[i],
            player2: winners[i + 1],
            round: maxRound + 1,
            winner: null
          });
        }
      }
    } else if (action === 'endTournament') {
      // حذف جميع اللاعبين والمباريات
      const Player = mongoose.models.Player;
      const Match = mongoose.models.Match;
      
      await Promise.all([
        Player.deleteMany({}),
        Match.deleteMany({}),
      ]);

      // إعادة فتح التسجيل
      settings.registrationOpen = true;
      await settings.save();
    } else if (action === 'end') {
      // حذف جميع المباريات
      await Match.deleteMany({});
      
      // إعادة تنشيط جميع اللاعبين
      await Player.updateMany({}, { isActive: true });

      return NextResponse.json({ message: 'تم إنهاء البطولة بنجاح' });
    } else if (action === 'deletePlayers') {
      // حذف جميع المباريات أولاً لإزالة العلاقات
      await Match.deleteMany({});
      
      // ثم حذف جميع اللاعبين
      await Player.deleteMany({});

      return NextResponse.json({ message: 'تم حذف جميع المتسابقين بنجاح' });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'حدث خطأ في تحديث إعدادات البطولة' }, { status: 500 });
  }
}
