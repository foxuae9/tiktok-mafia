import { useEffect, useState } from 'react';
import Head from 'next/head';
import { getSocket, disconnectSocket } from '@/lib/socket';

// مكون عرض التعليق
const CommentItem = ({ comment }) => (
  <div className="comment-item">
    <div className="user-info">
      <span className="username">{comment.userId}</span>
      <span className="time">{new Date(comment.timestamp).toLocaleTimeString('ar-AE')}</span>
    </div>
    <p className="message">{comment.text}</p>
  </div>
);

export default function Home() {
  const [comments, setComments] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    // معالجة الاتصال
    socket.on('connect', () => {
      console.log('🟢 تم الاتصال بالسيرفر');
      setIsConnected(true);
    });

    // استقبال التعليقات الجديدة
    socket.on('new-comment', (comment) => {
      console.log('💬 تعليق جديد:', comment);
      setComments(prev => [...prev, comment].slice(-50)); // نحتفظ بآخر 50 تعليق فقط
    });

    // معالجة قطع الاتصال
    socket.on('disconnect', () => {
      console.log('🔴 انقطع الاتصال');
      setIsConnected(false);
    });

    // تنظيف عند مغادرة الصفحة
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <div className="container">
      <Head>
        <title>تعليقات البث المباشر</title>
        <meta name="description" content="عرض تعليقات البث المباشر" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <main>
        <div className="header">
          <h1>💬 تعليقات البث</h1>
          <div className="connection-status">
            {isConnected ? 
              <span className="connected">🟢 متصل</span> : 
              <span className="disconnected">🔴 غير متصل</span>
            }
          </div>
        </div>

        <div className="comments-container">
          {comments.length === 0 ? (
            <div className="no-comments">
              <p>لا توجد تعليقات حالياً...</p>
              <p className="hint">التعليقات ستظهر هنا فور وصولها</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment, index) => (
                <CommentItem key={index} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 1rem;
          background: #f8f9fa;
          direction: rtl;
          font-family: 'Tajawal', sans-serif;
        }

        main {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 2rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .connection-status {
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: #f8f9fa;
        }

        .connected { color: #2ecc71; }
        .disconnected { color: #e74c3c; }

        .comments-container {
          min-height: 400px;
        }

        .no-comments {
          text-align: center;
          color: #7f8c8d;
          padding: 3rem 0;
        }

        .hint {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .comment-item {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 10px;
          transition: transform 0.2s;
        }

        .comment-item:hover {
          transform: translateX(-5px);
        }

        .user-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .username {
          font-weight: bold;
          color: #2c3e50;
        }

        .time {
          font-size: 0.8rem;
          color: #7f8c8d;
        }

        .message {
          margin: 0;
          color: #34495e;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
