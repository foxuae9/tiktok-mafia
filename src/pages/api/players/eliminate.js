import { getPlayers, updatePlayer } from '../../../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'طريقة غير مسموح بها' });
  }

  try {
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ message: 'يجب تحديد معرف اللاعب' });
    }

    const players = await getPlayers();
    const player = players.find(p => p.id === playerId);

    if (!player) {
      return res.status(404).json({ message: 'لم يتم العثور على اللاعب' });
    }

    // تحديث حالة اللاعب
    await updatePlayer(playerId, {
      ...player,
      isEliminated: true,
      status: 'eliminated',
      inMatch: false,
      matchId: null
    });

    res.status(200).json({ message: 'تم إقصاء اللاعب بنجاح' });
  } catch (error) {
    console.error('خطأ في إقصاء اللاعب:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إقصاء اللاعب' });
  }
}
