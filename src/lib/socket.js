import io from 'socket.io-client';

// إنشاء اتصال مفرد للسوكت (singleton)
let socket;

export function getSocket() {
    if (!socket) {
        socket = io("https://tiktok-mafia-1.onrender.com", {
            transports: ["websocket"]
        });

        // تسجيل الأحداث الأساسية
        socket.on('connect', () => {
            console.log('🟢 تم الاتصال بالسيرفر');
        });

        socket.on('disconnect', () => {
            console.log('🔴 انقطع الاتصال');
        });

        socket.on('connect_error', (error) => {
            console.error('❌ خطأ في الاتصال:', error.message);
        });
    }
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
