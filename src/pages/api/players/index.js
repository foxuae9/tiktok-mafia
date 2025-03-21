import dbConnect from '@/lib/dbConnect';
import Player from '@/models/Player';

export default async function handler(req, res) {
  console.log(`📝 ${req.method} /api/players - بداية الطلب`);
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'موجود' : 'غير موجود');
  
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
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
      console.log('الاسم المطلوب:', nickname);
      
      if (!nickname) {
        console.log('❌ لم يتم إدخال اسم');
        return res.status(400).json({ message: 'يرجى إدخال اسم اللاعب' });
      }

      // التحقق من وجود اللاعب
      console.log('🔍 التحقق من وجود اللاعب...');
      const existingPlayer = await Player.findOne({ nickname });
      if (existingPlayer) {
        console.log('❌ الاسم مستخدم');
        return res.status(400).json({ message: 'هذا الاسم مستخدم بالفعل' });
      }

      console.log('✨ إنشاء لاعب جديد...');
      const player = await Player.create({ 
        nickname,
        createdAt: new Date()
      });
      console.log('✅ تم إنشاء اللاعب:', player);

      return res.status(201).json(player);
    }

    return res.status(405).json({ message: 'الطريقة غير مدعومة' });

  } catch (error) {
    console.error('❌ خطأ:', error);
    console.error('تفاصيل الخطأ:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
