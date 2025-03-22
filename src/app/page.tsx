'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface Settings {
  registrationOpen: boolean;
}

export default function Home() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<Settings>({ registrationOpen: true });
  const [playersCount, setPlayersCount] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchSettings();
    fetchPlayersCount();
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
    }

    const interval = setInterval(() => {
      fetchPlayersCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (!data.error) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchPlayersCount = async () => {
    try {
      const response = await fetch('/api/players');
      const players = await response.json();
      setPlayersCount(players.length);
    } catch (error) {
      console.error('Error fetching players count:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!settings.registrationOpen) {
      setError('عذراً، التسجيل مغلق حالياً');
      return;
    }

    if (!name.trim()) {
      setError('الرجاء إدخال اسم اللاعب');
      return;
    }

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMessage('تم التسجيل بنجاح!');
        setName('');
        fetchPlayersCount();
      }
    } catch (err) {
      setError('حدث خطأ في التسجيل');
    }
  };

  const progressPercentage = (playersCount / 32) * 100;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* خلفية الفيديو */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          className="object-cover w-full h-full opacity-50"
          style={{ filter: 'brightness(0.4)' }}
        >
          <source src="/videos/FOX_Street_Fighter.mp4" type="video/mp4" />
        </video>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* الشعار */}
          <Logo className="mb-8" />

          {/* العنوان */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 animate-pulse flex flex-col items-center">
            <span>بطولة 🅵🅾🆇</span>
            <span className="text-blue-400 mt-2">على TIKTOK</span>
          </h1>

          {/* زر البث المباشر والدسكورد */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.tiktok.com/@foxuae35"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-pink-600 to-pink-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:from-pink-500 hover:to-pink-300"
            >
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <span>شاهد البث المباشر</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1 2v12h14V6H5zm4 3l5 3-5 3V9z"/>
                </svg>
              </div>
            </a>

            <a
              href="https://discord.gg/sjTAX8mF"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:from-indigo-500 hover:to-indigo-300"
            >
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <span>انضم للدسكورد</span>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
            </a>
          </div>

          {/* شريط التقدم */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="text-white text-xl mb-2 flex justify-between items-center">
              <span>المقاعد المتبقية: {32 - playersCount}</span>
              <span>{playersCount}/32</span>
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="w-full h-full opacity-75 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* نموذج التسجيل */}
          {!settings.registrationOpen ? (
            <div className="text-center">
              <p className="text-xl text-red-400 mb-4">عذراً، تم إغلاق التسجيل للبطولة</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/tournament"
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-blue-300"
                >
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <span>عرض البطولة</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 005 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                    </svg>
                  </div>
                </Link>
                <Link 
                  href="/admin"
                  className="inline-block bg-gradient-to-r from-purple-600 to-purple-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:from-purple-500 hover:to-purple-300"
                >
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <span>لوحة التحكم</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M10.5 6h3V3h-3v3zm-3.5 3V6h3V3H4v9h6V9H7zm10 0V6h-3V3h6v9h-6V9h3zM7 15h10v-3h3v9H4v-9h3v3z"/>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          ) : playersCount >= 32 ? (
            <div className="bg-red-500/90 backdrop-blur-md text-white p-6 rounded-xl text-center mb-6">
              <h2 className="text-xl font-bold mb-2">اكتمل العدد</h2>
              <p>عذراً، تم اكتمال العدد المطلوب من اللاعبين</p>
              <Link 
                href="/tournament"
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-blue-300"
              >
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  <span>عرض البطولة</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 005 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                  </svg>
                </div>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-black/60 backdrop-blur-md rounded-xl p-6">
              <div className="mb-4">
                <label htmlFor="name" className="block text-white mb-2">
                  اسم اللاعب
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="أدخل اسمك"
                  maxLength={50}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
              >
                تسجيل
              </button>

              {message && (
                <div className="mt-4 bg-green-500/50 text-white p-4 rounded-lg">
                  {message}
                </div>
              )}
              {error && (
                <div className="mt-4 bg-red-500/50 text-white p-4 rounded-lg">
                  {error}
                </div>
              )}
            </form>
          )}

          <div className="text-center mt-6">
            <Link
              href="/tournament"
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:from-blue-500 hover:to-blue-300"
            >
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <span>عرض البطولة</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 005 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </svg>
              </div>
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
      </div>
    </main>
  );
}
