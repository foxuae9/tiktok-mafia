'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Image from 'next/image';

interface Player {
  _id: string;
  name: string;
  position: number;
}

interface Match {
  _id: string;
  player1: Player;
  player2: Player;
  winner: Player | null;
  round: number;
}

export default function TournamentPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, playersRes] = await Promise.all([
        fetch('/api/matches'),
        fetch('/api/players')
      ]);

      const [matchesData, playersData] = await Promise.all([
        matchesRes.json(),
        playersRes.json()
      ]);

      setMatches(matchesData);
      setPlayers(playersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getMatchesByRound = () => {
    const rounds = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    }, {} as Record<number, Match[]>);

    return Object.entries(rounds).sort(([a], [b]) => Number(a) - Number(b));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-white text-2xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-blue-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* الشعار والعنوان */}
        <div className="text-center mb-8">
          <Logo className="mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">بطولة 🅵🅾🆇</h1>
          <p className="text-blue-200 mb-4">عدد اللاعبين: {players.length}</p>
          
          {/* أزرار البث والدسكورد */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.tiktok.com/@foxuae35"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-pink-600 to-pink-400 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105 hover:from-pink-500 hover:to-pink-300"
            >
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <span>شاهد البث المباشر</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1 2v12h14V6H5zm4 3l5 3-5 3V9z"/>
                </svg>
              </div>
            </a>

            <a
              href="https://discord.gg/sjTAX8mF"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-400 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:scale-105 hover:from-indigo-500 hover:to-indigo-300"
            >
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <span>انضم للدسكورد</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
            </a>
          </div>
        </div>

        {/* قائمة اللاعبين */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">اللاعبين المشاركين</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {players.map((player) => (
              <div
                key={player._id}
                className="bg-white/5 p-3 rounded-lg text-white"
              >
                <div className="font-bold">{player.name}</div>
                <div className="text-sm text-gray-400">#{player.position}</div>
              </div>
            ))}
          </div>
        </div>

        {/* المباريات */}
        <div className="space-y-8">
          {getMatchesByRound().map(([round, roundMatches]) => (
            <div key={round} className="bg-black/30 backdrop-blur-md rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                الجولة {round}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roundMatches.map((match) => (
                  <div
                    key={match._id}
                    className="flex items-center justify-center gap-4 mb-4 bg-gray-700/90 p-4 rounded-lg shadow-lg border border-gray-600"
                  >
                    <div className="text-center flex-1 text-right">
                      <span className={`text-lg ${
                        match.winner && match.winner._id === match.player1._id
                          ? 'text-green-500 font-bold'
                          : match.winner
                          ? 'text-red-500 line-through'
                          : ''
                      }`}>
                        {match.player1.name}
                      </span>
                    </div>
                    <div>
                      <Image
                        src="/images/VS2.png"
                        alt="VS"
                        width={45}
                        height={45}
                        className="opacity-100"
                      />
                    </div>
                    <div className="text-center flex-1 text-left">
                      <span className={`text-lg ${
                        match.winner && match.winner._id === match.player2._id
                          ? 'text-green-500 font-bold'
                          : match.winner
                          ? 'text-red-500 line-through'
                          : ''
                      }`}>
                        {match.player2.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* زر العودة وحقوق الملكية */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للصفحة الرئيسية
          </Link>
          <div className="mt-8 text-gray-400 text-sm">
            جميع الحقوق محفوظة{' '}
            <a 
              href="https://foxuae35.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              foxuae35.com
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
