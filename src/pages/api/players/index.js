import dbConnect from '@/lib/dbConnect';
import Player from '@/models/Player';
import { getRegistrationStatus } from '@/pages/api/admin/registration-status';

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
      
      const status = await getRegistrationStatus();
      console.log('📊 حالة التسجيل:', status.isOpen ? 'مفتوح' : 'مغلق');
      
      if (!status.isOpen) {
        console.log('❌ التسجيل مغلق حالياً');
        return res.status(403).json({ message: 'التسجيل مغلق حالياً' });
      }

      const { nickname } = req.body;
      console.log('👤 اسم اللاعب المطلوب تسجيله:', nickname);

      if (!nickname || nickname.trim() === '') {
        console.log('❌ لم يتم إدخال اسم اللاعب');
        return res.status(400).json({ message: 'يجب إدخال اسم اللاعب' });
      }

      const existingPlayer = await Player.findOne({ nickname });
      if (existingPlayer) {
        console.log('❌ الاسم مستخدم بالفعل:', nickname);
        return res.status(400).json({ message: 'هذا الاسم مستخدم بالفعل' });
      }

      const playersCount = await Player.countDocuments();
      console.log('📊 عدد اللاعبين الحالي:', playersCount);
      
      if (playersCount >= 32) {
        console.log('❌ اكتمل العدد المسموح به من اللاعبين');
        return res.status(403).json({ message: 'عذراً، اكتمل العدد المسموح به من اللاعبين' });
      }

      const player = await Player.create({ 
        nickname,
        position: playersCount + 1
      });
      console.log('✅ تم تسجيل اللاعب بنجاح:', player);

      return res.status(201).json(player);
    }

    console.log('❌ طريقة غير مسموح بها:', req.method);
    return res.status(405).json({ message: 'طريقة غير مسموح بها' });
    
  } catch (error) {
    console.error('❌ خطأ في معالجة الطلب:', error);
    return res.status(500).json({ 
      message: 'حدث خطأ في معالجة الطلب',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
