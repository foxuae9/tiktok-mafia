import { useState, useEffect } from 'react';
import io from 'socket.io-client';

let socket;

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [comments, setComments] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // استخدام متغير البيئة للاتصال بالسيرفر
    socket = io(process.env.SOCKET_SERVER_URL);

    socket.on('connect', () => {
      setConnected(true);
      console.log('تم الاتصال بالسيرفر');
    });

    socket.on('newComment', (comment) => {
      setComments(prev => [...prev, comment].slice(-50)); // الاحتفاظ بآخر 50 تعليق فقط
    });

    socket.on('newGift', (gift) => {
      setGifts(prev => [...prev, gift].slice(-20)); // الاحتفاظ بآخر 20 هدية فقط
    });

    socket.on('liveConnected', (data) => {
      console.log(`تم الاتصال ببث ${data.username}`);
      setError('');
    });

    socket.on('liveError', (data) => {
      setError(data.message);
    });

    socket.on('connect_error', (error) => {
      console.error('خطأ في الاتصال:', error);
      setError('فشل الاتصال بالسيرفر. يرجى المحاولة مرة أخرى.');
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const connectToLive = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('connectToLive', username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">مشاهد البث المباشر</h1>
        
        {/* نموذج الاتصال */}
        <form onSubmit={connectToLive} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم في TikTok"
              className="flex-1 p-2 border rounded-lg"
              dir="rtl"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              اتصال
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>

        {/* عرض التعليقات والهدايا */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* قسم التعليقات */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-xl font-bold mb-4">التعليقات</h2>
            <div className="h-[400px] overflow-y-auto">
              {comments.map((comment, i) => (
                <div key={i} className="p-2 hover:bg-gray-50 border-b">
                  <span className="font-bold">{comment.nickname}: </span>
                  <span>{comment.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* قسم الهدايا */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-xl font-bold mb-4">الهدايا</h2>
            <div className="h-[400px] overflow-y-auto">
              {gifts.map((gift, i) => (
                <div key={i} className="p-2 hover:bg-gray-50 border-b">
                  <p>
                    <span className="font-bold">{gift.nickname}</span>
                    <span className="mx-2">أرسل</span>
                    <span className="text-purple-600">{gift.giftName}</span>
                    <span className="mx-2">({gift.diamondCount} 💎)</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
