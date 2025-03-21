import { useEffect } from 'react';
import socket from '@/lib/socket';

export default function HomePage() {
  useEffect(() => {
    // الاتصال عند تشغيل الصفحة
    socket.on('connect', () => {
      console.log('🟢 تم الاتصال بالسيرفر!');
    });

    socket.on('disconnect', () => {
      console.log('🔌 تم فصل الاتصال');
    });

    socket.on('connect_error', (err) => {
      console.log('❌ خطأ في الاتصال:', err.message);
    });

    // تنظيف الاتصال عند مغادرة الصفحة
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  return (
    <div>
      <h1>🔥 صفحة اختبار الاتصال بـ WebSocket</h1>
    </div>
  );
}
