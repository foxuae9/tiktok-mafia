'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Player {
  _id: string;
  name: string;
  position: number;
  isActive: boolean;
}

interface Match {
  _id: string;
  player1: Player;
  player2: Player;
  winner: Player | null;
  round: number;
}

interface Settings {
  registrationOpen: boolean;
}

export default function AdminPanel() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [settings, setSettings] = useState<Settings>({ registrationOpen: true });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedPlayer1, setSelectedPlayer1] = useState('');
  const [selectedPlayer2, setSelectedPlayer2] = useState('');
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedPlayerToDelete, setSelectedPlayerToDelete] = useState('');
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    const fetchDataAndLog = async () => {
      try {
        // جلب اللاعبين
        const playersResponse = await fetch('/api/players');
        const playersData = await playersResponse.json();
        if (!playersResponse.ok) {
          throw new Error(playersData.error || 'حدث خطأ في جلب اللاعبين');
        }
        console.log('Players data:', playersData); // للتأكد من البيانات
        setPlayers(playersData);

        // جلب المباريات
        const matchesResponse = await fetch('/api/matches');
        const matchesData = await matchesResponse.json();
        if (!matchesResponse.ok) {
          throw new Error(matchesData.error || 'حدث خطأ في جلب المباريات');
        }
        console.log('Matches data:', matchesData); // للتأكد من البيانات
        setMatches(matchesData);

        // جلب إعدادات التسجيل
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        if (!settingsResponse.ok) {
          throw new Error(settingsData.error || 'حدث خطأ في جلب الإعدادات');
        }
        setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('حدث خطأ في جلب البيانات');
      }
    };

    fetchDataAndLog();
    const interval = setInterval(fetchDataAndLog, 5000);
    return () => clearInterval(interval);
  }, [router]);

  // دالة للحصول على اللاعبين المتاحين للجولة المحددة
  const getAvailablePlayersForRound = (round: number) => {
    console.log('Current players:', players); // للتأكد من البيانات
    console.log('Current matches:', matches); // للتأكد من البيانات
    console.log('Selected round:', round); // للتأكد من البيانات

    if (round === 1) {
      // في الجولة الأولى، اعرض جميع اللاعبين النشطين الذين لم يشاركوا في أي مباراة في الجولة الأولى
      const availablePlayers = players.filter(player => {
        if (!player.isActive) return false;
        
        const hasPlayedInRound = matches.some(match => 
          match.round === 1 && 
          (match.player1._id === player._id || match.player2._id === player._id)
        );
        return !hasPlayedInRound;
      });

      console.log('Available players for round 1:', availablePlayers); // للتأكد من البيانات
      return availablePlayers;
    } else {
      // في الجولات الأخرى، اعرض فقط الفائزين النشطين من الجولة السابقة الذين لم يشاركوا في الجولة الحالية
      const winnersFromPreviousRound = matches
        .filter(match => match.round === round - 1 && match.winner)
        .map(match => match.winner!._id);

      console.log('Winners from previous round:', winnersFromPreviousRound); // للتأكد من البيانات

      // إذا لم تكن هناك مباريات في الجولة السابقة، اعرض جميع اللاعبين النشطين
      if (matches.filter(match => match.round === round - 1).length === 0) {
        const activePlayers = players.filter(player => player.isActive);
        console.log('Active players (no previous matches):', activePlayers); // للتأكد من البيانات
        return activePlayers;
      }

      const availablePlayers = players.filter(player => {
        if (!player.isActive) return false;
        
        const isWinnerFromPreviousRound = winnersFromPreviousRound.includes(player._id);
        const hasPlayedInCurrentRound = matches.some(match => 
          match.round === round && 
          (match.player1._id === player._id || match.player2._id === player._id)
        );
        return isWinnerFromPreviousRound && !hasPlayedInCurrentRound;
      });

      console.log('Available players for round:', availablePlayers); // للتأكد من البيانات
      return availablePlayers;
    }
  };

  // دالة لإنشاء مباراة جديدة
  const createMatch = async () => {
    if (!selectedPlayer1 || !selectedPlayer2) return;

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player1Id: selectedPlayer1,
          player2Id: selectedPlayer2,
          round: selectedRound,
        }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      // تحديث البيانات وإعادة تعيين الاختيارات
      setSelectedPlayer1('');
      setSelectedPlayer2('');
      fetchData();
    } catch (error) {
      console.error('Error creating match:', error);
      alert('حدث خطأ في إنشاء المباراة');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminAuthenticated');
    router.push('/admin/login');
  };

  // التحقق من أن اللاعب غير مشارك في أي مباراة في نفس الجولة
  const isPlayerInRound = (playerId: string, round: number) => {
    return matches.some(match => 
      match.round === round && 
      (match.player1._id === playerId || match.player2._id === playerId)
    );
  };

  const fetchData = async () => {
    try {
      // جلب اللاعبين
      const playersResponse = await fetch('/api/players');
      const playersData = await playersResponse.json();
      if (!playersResponse.ok) {
        throw new Error(playersData.error || 'حدث خطأ في جلب اللاعبين');
      }
      if (!Array.isArray(playersData)) {
        throw new Error('بيانات اللاعبين غير صحيحة');
      }
      setPlayers(playersData);

      // جلب المباريات
      const matchesResponse = await fetch('/api/matches');
      const matchesData = await matchesResponse.json();
      if (!matchesResponse.ok) {
        throw new Error(matchesData.error || 'حدث خطأ في جلب المباريات');
      }
      if (!Array.isArray(matchesData)) {
        throw new Error('بيانات المباريات غير صحيحة');
      }
      setMatches(matchesData);

      // جلب إعدادات التسجيل
      const settingsResponse = await fetch('/api/settings');
      const settingsData = await settingsResponse.json();
      if (!settingsResponse.ok) {
        throw new Error(settingsData.error || 'حدث خطأ في جلب الإعدادات');
      }
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('حدث خطأ في جلب البيانات');
    }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchData();
    // تحديث البيانات كل 5 ثواني
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const setMatchWinner = async (matchId: string, winnerId: string) => {
    try {
      const response = await fetch('/api/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          winnerId,
        }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      // تحديث البيانات
      fetchData();
    } catch (error) {
      console.error('Error updating match:', error);
      alert('حدث خطأ في تحديث المباراة');
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المباراة؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/matches?id=${matchId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      // تحديث البيانات
      fetchData();
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('حدث خطأ في حذف المباراة');
    }
  };

  const deletePlayer = async (playerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا اللاعب؟')) return;
    
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage('تم حذف اللاعب بنجاح');
        fetchData();
      }
    } catch (err) {
      setError('حدث خطأ في حذف اللاعب');
    }
  };

  const deletePlayers = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف جميع المتسابقين؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    try {
      const response = await fetch('/api/tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'deletePlayers' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'حدث خطأ في حذف المتسابقين');
      }

      alert('تم حذف جميع المتسابقين بنجاح');
      fetchData(); // تحديث البيانات
    } catch (error) {
      console.error('Error deleting players:', error);
      alert('حدث خطأ في حذف المتسابقين');
    }
  };

  const toggleRegistration = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: settings?.registrationOpen ? 'close' : 'open',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'حدث خطأ في تحديث حالة التسجيل');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error toggling registration:', error);
      alert('حدث خطأ في تحديث حالة التسجيل');
    }
  };

  const endCurrentRound = async () => {
    if (!confirm('هل أنت متأكد من إنهاء الجولة الحالية وإنشاء المباريات التالية؟')) return;
    
    try {
      const response = await fetch('/api/tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'endMatch' }),
      });
      
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage('تم إنهاء الجولة وإنشاء المباريات التالية بنجاح');
        fetchData();
      }
    } catch (err) {
      setError('حدث خطأ في إنهاء الجولة');
    }
  };

  const endTournament = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في إنهاء البطولة؟ سيتم حذف جميع المباريات وإعادة تنشيط جميع اللاعبين.')) {
      return;
    }

    try {
      const response = await fetch('/api/tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'end' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'حدث خطأ في إنهاء البطولة');
      }

      alert('تم إنهاء البطولة بنجاح');
      fetchData(); // تحديث البيانات
    } catch (error) {
      console.error('Error ending tournament:', error);
      alert('حدث خطأ في إنهاء البطولة');
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-900 text-white">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <button
            onClick={logout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            تسجيل خروج
          </button>
        </div>

        {message && (
          <div className="bg-green-500 text-white p-3 rounded mb-4">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* قسم اللاعبين */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">اللاعبين ({players.length})</h2>
            <div className="flex gap-4">
              <select
                className="w-full bg-gray-700 text-white p-3 rounded"
                onChange={(e) => setSelectedPlayerToDelete(e.target.value)}
                value={selectedPlayerToDelete}
              >
                <option value="">اختر لاعب للحذف...</option>
                {players.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name} (#{player.position})
                  </option>
                ))}
              </select>
              {selectedPlayerToDelete && (
                <button
                  onClick={() => {
                    if (confirm('هل أنت متأكد من حذف هذا اللاعب؟')) {
                      deletePlayer(selectedPlayerToDelete);
                      setSelectedPlayerToDelete('');
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded whitespace-nowrap"
                >
                  حذف اللاعب
                </button>
              )}
            </div>
          </div>

          {/* قسم المباريات */}
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">المباريات الحالية</h2>
            <div className="space-y-4">
              {matches
                .filter(match => !match.winner) // عرض المباريات التي لم يتم تحديد الفائز فيها فقط
                .sort((a, b) => a.round - b.round) // ترتيب حسب رقم الجولة
                .map((match) => (
                  <div key={match._id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">
                        {match.player1.name} (#{match.player1.position})
                      </span>
                      <span className="text-yellow-500 mx-2">VS</span>
                      <span className="text-lg">
                        {match.player2.name} (#{match.player2.position})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">الجولة {match.round}</span>
                      <div className="space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => setMatchWinner(match._id, match.player1._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          فوز {match.player1.name}
                        </button>
                        <button
                          onClick={() => setMatchWinner(match._id, match.player2._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          فوز {match.player2.name}
                        </button>
                        <button
                          onClick={() => deleteMatch(match._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {matches.filter(match => !match.winner).length === 0 && (
                <div className="text-center text-gray-400">
                  لا توجد مباريات حالية
                </div>
              )}
            </div>
          </div>

          {/* قسم إضافة مباراة جديدة */}
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">إضافة مباراة جديدة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">الجولة:</label>
                <select
                  value={selectedRound}
                  onChange={(e) => {
                    const newRound = parseInt(e.target.value);
                    setSelectedRound(newRound);
                    // إعادة تعيين اختيارات اللاعبين عند تغيير الجولة
                    setSelectedPlayer1('');
                    setSelectedPlayer2('');
                  }}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                >
                  {[1, 2, 3, 4, 5].map((round) => (
                    <option key={round} value={round}>
                      الجولة {round}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">اللاعب الأول:</label>
                <select
                  value={selectedPlayer1}
                  onChange={(e) => setSelectedPlayer1(e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                >
                  <option value="">اختر اللاعب الأول</option>
                  {getAvailablePlayersForRound(selectedRound)
                    .filter(player => player._id !== selectedPlayer2)
                    .map((player) => (
                      <option key={player._id} value={player._id}>
                        {player.name} (#{player.position})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">اللاعب الثاني:</label>
                <select
                  value={selectedPlayer2}
                  onChange={(e) => setSelectedPlayer2(e.target.value)}
                  className="w-full bg-gray-700 text-white p-2 rounded"
                >
                  <option value="">اختر اللاعب الثاني</option>
                  {getAvailablePlayersForRound(selectedRound)
                    .filter(player => player._id !== selectedPlayer1)
                    .map((player) => (
                      <option key={player._id} value={player._id}>
                        {player.name} (#{player.position})
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={createMatch}
                disabled={!selectedPlayer1 || !selectedPlayer2}
                className={`${
                  !selectedPlayer1 || !selectedPlayer2
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white font-bold py-2 px-4 rounded`}
              >
                إضافة المباراة
              </button>
            </div>
          </div>

          {/* قسم أزرار التحكم في التسجيل */}
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">إدارة التسجيل</h2>
            <div className="flex gap-4">
              <button
                onClick={toggleRegistration}
                className={`${
                  settings.registrationOpen
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white font-bold py-2 px-4 rounded`}
              >
                {settings.registrationOpen ? 'إغلاق التسجيل' : 'فتح التسجيل'}
              </button>
            </div>
          </div>

          {/* قسم إدارة البطولة */}
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">إدارة البطولة</h2>
            <div className="flex gap-4">
              <button
                onClick={endTournament}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                إنهاء البطولة
              </button>
              <button
                onClick={deletePlayers}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                حذف المتسابقين
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
