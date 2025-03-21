import dbConnect from '@/lib/dbConnect';
import RegistrationStatus from '@/models/RegistrationStatus';

export default async function handler(req, res) {
  console.log(`📝 ${req.method} /api/admin/registration-status - بداية الطلب`);
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'موجود' : 'غير موجود');

  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await dbConnect();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    if (req.method === 'GET') {
      console.log('🔍 جاري البحث عن حالة التسجيل...');
      let status = await RegistrationStatus.findOne({});
      
      if (!status) {
        console.log('🆕 إنشاء حالة تسجيل جديدة...');
        status = await RegistrationStatus.create({ isOpen: true });
      }
      
      console.log('✅ حالة التسجيل:', status);
      return res.status(200).json(status);
    }

    if (req.method === 'POST') {
      console.log('🔄 تحديث حالة التسجيل...');
      const { isOpen } = req.body;
      
      let status = await RegistrationStatus.findOne({});
      
      if (!status) {
        status = await RegistrationStatus.create({ isOpen });
      } else {
        status.isOpen = isOpen;
        await status.save();
      }
      
      console.log('✅ تم التحديث:', status);
      return res.status(200).json(status);
    }

    return res.status(405).json({ message: 'Method not allowed' });
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
