import dbConnect from '@/lib/dbConnect';
import { getRegistrationStatus, setRegistrationStatus } from './registration-status';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'طريقة غير مسموح بها' });
  }

  try {
    await dbConnect();
    const currentStatus = await getRegistrationStatus();
    const newStatus = await setRegistrationStatus(!currentStatus.isOpen);
    
    res.status(200).json({ 
      message: 'تم تحديث حالة التسجيل بنجاح',
      isOpen: newStatus.isOpen
    });
  } catch (error) {
    console.error('❌ خطأ في تغيير حالة التسجيل:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تغيير حالة التسجيل' });
  }
}
