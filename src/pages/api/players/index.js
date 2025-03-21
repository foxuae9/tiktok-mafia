import { getPlayers } from '../../../lib/storage';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const players = getPlayers();
      return res.status(200).json(players);
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات اللاعبين:', error);
      return res.status(500).json({ message: 'حدث خطأ في جلب بيانات اللاعبين' });
    }
  }

  return res.status(405).json({ message: 'طريقة غير مسموح بها' });
}
