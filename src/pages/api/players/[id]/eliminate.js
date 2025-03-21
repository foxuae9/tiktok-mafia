import dbConnect from '@/lib/dbConnect';
import Player from '../../../../models/Player';

export default async function handler(req, res) {
  const { id } = req.query;

  await dbConnect();

  if (req.method === 'POST') {
    try {
      const player = await Player.findByIdAndUpdate(
        id,
        { isEliminated: true },
        { new: true }
      );

      if (!player) {
        return res.status(404).json({ message: 'اللاعب غير موجود' });
      }

      res.status(200).json(player);
    } catch (error) {
      res.status(500).json({ message: 'خطأ في تحديث حالة اللاعب' });
    }
  } else {
    res.status(405).json({ message: 'الطريقة غير مدعومة' });
  }
}
