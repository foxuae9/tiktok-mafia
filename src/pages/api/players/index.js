import dbConnect from '@/lib/dbConnect';
import Player from '@/models/Player';

export default async function handler(req, res) {
  console.log(`📝 ${req.method} /api/players - بداية الطلب`);
  
  try {
    await dbConnect();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    if (req.method === 'GET') {
      console.log('🔍 جاري البحث عن اللاعبين...');
      const players = await Player.find({}).sort({ createdAt: -1 });
      console.log(`✅ تم العثور على ${players.length} لاعب`);
      return res.status(200).json(players);
    }

    if (req.method === 'POST') {
      console.log('➕ طلب تسجيل لاعب جديد');
      
      const { nickname } = req.body;
      if (!nickname) {
        return res.status(400).json({ message: 'يرجى إدخال اسم اللاعب' });
      }

      // التحقق من وجود اللاعب
      const existingPlayer = await Player.findOne({ nickname });
      if (existingPlayer) {
        return res.status(400).json({ message: 'هذا الاسم مستخدم بالفعل' });
      }

      const player = await Player.create({ 
        nickname,
        createdAt: new Date()
      });

      return res.status(201).json(player);
    }

    return res.status(405).json({ message: 'الطريقة غير مدعومة' });

  } catch (error) {
    console.error('❌ خطأ:', error);
    return res.status(500).json({ message: error.message });
  }
}
