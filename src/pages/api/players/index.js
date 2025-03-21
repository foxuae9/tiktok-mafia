import dbConnect from '@/lib/dbConnect';
import Player from '@/models/Player';
import { getRegistrationStatus } from '@/pages/api/admin/registration-status';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const players = await Player.find({}).sort({ createdAt: -1 });
      return res.status(200).json(players);
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات اللاعبين:', error);
      return res.status(500).json({ message: 'حدث خطأ في جلب بيانات اللاعبين' });
    }
  }

  if (req.method === 'POST') {
    try {
      const status = await getRegistrationStatus();
      if (!status.isOpen) {
        return res.status(403).json({ message: 'التسجيل مغلق حالياً' });
      }

      const { nickname } = req.body;
      if (!nickname || nickname.trim() === '') {
        return res.status(400).json({ message: 'يجب إدخال اسم اللاعب' });
      }

      const existingPlayer = await Player.findOne({ nickname });
      if (existingPlayer) {
        return res.status(400).json({ message: 'هذا الاسم مستخدم بالفعل' });
      }

      const playersCount = await Player.countDocuments();
      if (playersCount >= 32) {
        return res.status(403).json({ message: 'عذراً، اكتمل العدد المسموح به من اللاعبين' });
      }

      const player = await Player.create({ 
        nickname,
        position: playersCount + 1
      });

      return res.status(201).json(player);
    } catch (error) {
      console.error('❌ خطأ في تسجيل اللاعب:', error);
      return res.status(500).json({ message: 'حدث خطأ في تسجيل اللاعب' });
    }
  }

  return res.status(405).json({ message: 'طريقة غير مسموح بها' });
}
