import dbConnect from '@/lib/dbConnect';
import Player from '@/models/Player';

export default async function handler(req, res) {
  console.log('🎮 طلب إقصاء لاعب:', req.query.id);
  const { id } = req.query;

  try {
    await dbConnect();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    if (req.method === 'POST') {
      console.log('🔄 جاري تحديث حالة اللاعب...');
      const player = await Player.findByIdAndUpdate(
        id,
        { isEliminated: true },
        { new: true }
      );

      if (!player) {
        console.log('❌ اللاعب غير موجود:', id);
        return res.status(404).json({ message: 'اللاعب غير موجود' });
      }

      console.log('✅ تم إقصاء اللاعب بنجاح:', player.nickname);
      res.status(200).json(player);
    } else {
      console.log('❌ طريقة غير مدعومة:', req.method);
      res.status(405).json({ message: 'الطريقة غير مدعومة' });
    }
  } catch (error) {
    console.error('❌ خطأ في إقصاء اللاعب:', error);
    res.status(500).json({ message: 'حدث خطأ في تحديث حالة اللاعب' });
  }
}
