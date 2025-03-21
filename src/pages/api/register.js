import { getPlayers, addPlayer } from '../../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { nickname } = req.body;

    if (!nickname || nickname.trim() === '') {
      return res.status(400).json({ message: 'يجب إدخال اسم اللاعب' });
    }

    // التحقق من وجود اللاعب
    const players = getPlayers();
    const existingPlayer = players.find(p => p.nickname === nickname);
    
    if (existingPlayer) {
      return res.status(400).json({ message: 'هذا الاسم مستخدم بالفعل' });
    }

    // إضافة اللاعب الجديد
    const newPlayer = {
      id: Date.now().toString(),
      nickname,
      status: 'active',
      wins: 0,
      losses: 0,
      isEliminated: false,
      currentRound: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addPlayer(newPlayer);
    console.log('✅ تم تسجيل لاعب جديد:', nickname);
    
    return res.status(200).json(newPlayer);
  } catch (error) {
    console.error('❌ خطأ في تسجيل اللاعب:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تسجيل اللاعب' });
  }
}
