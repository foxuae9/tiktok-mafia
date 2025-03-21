import dbConnect from '../../../../lib/dbConnect';
import { getRegistrationStatus, setRegistrationStatus } from './registration-status';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'طريقة غير مسموح بها' });
  }

  try {
    const currentStatus = getRegistrationStatus();
    setRegistrationStatus(!currentStatus.isOpen);
    
    res.status(200).json({ 
      message: 'تم تحديث حالة التسجيل بنجاح',
      isOpen: !currentStatus.isOpen
    });
  } catch (error) {
    console.error('خطأ في تغيير حالة التسجيل:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تغيير حالة التسجيل' });
  }
}
