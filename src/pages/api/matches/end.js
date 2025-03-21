import { getPlayers, updatePlayer } from '../../../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'طريقة غير مسموح بها' });
  }

  try {
    const { matchId, winnerId, loserId } = req.body;
    
    if (!matchId || !winnerId || !loserId) {
      return res.status(400).json({ message: 'يجب تحديد معرف المباراة والفائز والخاسر' });
    }

    const players = await getPlayers();
    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);

    if (!winner || !loser) {
      return res.status(404).json({ message: 'لم يتم العثور على أحد اللاعبين' });
    }

    // تحديد المجموعة الجديدة للفائز في الدور التالي
    const nextRound = winner.currentRound + 1;
    const currentGroup = winner.group || 'A';
    const nextGroup = currentGroup; // نحتفظ بنفس المجموعة

    // تحديث الفائز: زيادة عدد مرات الفوز والانتقال للدور التالي
    await updatePlayer(winnerId, {
      ...winner,
      wins: (winner.wins || 0) + 1,
      inMatch: false,
      matchId: null,
      currentRound: nextRound,
      group: nextGroup,
      updatedAt: new Date().toISOString()
    });

    // تحديث الخاسر: زيادة عدد مرات الخسارة وإقصاؤه
    await updatePlayer(loserId, {
      ...loser,
      losses: (loser.losses || 0) + 1,
      inMatch: false,
      matchId: null,
      isEliminated: true,
      status: 'eliminated',
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ 
      message: 'تم إنهاء المباراة بنجاح',
      winner: {
        nickname: winner.nickname,
        newRound: nextRound,
        group: nextGroup
      },
      loser: {
        nickname: loser.nickname
      }
    });

  } catch (error) {
    console.error('خطأ في إنهاء المباراة:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إنهاء المباراة' });
  }
}
