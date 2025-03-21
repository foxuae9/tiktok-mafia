import { getPlayers, updatePlayer } from '../../../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'طريقة غير مسموح بها' });
  }

  try {
    const { player1Id, player2Id } = req.body;

    if (!player1Id || !player2Id) {
      return res.status(400).json({ message: 'يجب تحديد اللاعبين' });
    }

    const players = await getPlayers();
    const player1 = players.find(p => p.id === player1Id);
    const player2 = players.find(p => p.id === player2Id);

    if (!player1 || !player2) {
      return res.status(404).json({ message: 'لم يتم العثور على اللاعبين' });
    }

    if (player1.isEliminated || player2.isEliminated) {
      return res.status(400).json({ message: 'لا يمكن بدء مباراة مع لاعب مقصى' });
    }

    if (player1.inMatch || player2.inMatch) {
      return res.status(400).json({ message: 'أحد اللاعبين في مباراة حالياً' });
    }

    const matchId = `match_${Date.now()}`;

    // تحديث حالة اللاعب الأول
    await updatePlayer(player1Id, {
      ...player1,
      inMatch: true,
      matchId
    });

    // تحديث حالة اللاعب الثاني
    await updatePlayer(player2Id, {
      ...player2,
      inMatch: true,
      matchId
    });

    res.status(200).json({
      message: 'تم بدء المباراة بنجاح',
      matchId,
      players: [player1, player2]
    });
  } catch (error) {
    console.error('خطأ في بدء المباراة:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء بدء المباراة' });
  }
}
