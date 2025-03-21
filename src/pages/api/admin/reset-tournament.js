import { resetTournament } from '../../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'طريقة غير مسموح بها' });
  }

  try {
    resetTournament();
    console.log('✅ تم إعادة تعيين البطولة بنجاح');
    return res.status(200).json({ message: 'تم إعادة تعيين البطولة بنجاح' });
  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين البطولة:', error);
    return res.status(500).json({ message: 'حدث خطأ في إعادة تعيين البطولة' });
  }
}
