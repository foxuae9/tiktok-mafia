import { io } from "socket.io-client";

// نمط Singleton للسوكيت
let socket = null;

export function getSocket() {
    if (!socket) {
        socket = io("https://tiktok-mafia-server.onrender.com", {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        });

        // تسجيل أحداث الاتصال
        socket.on('connect', () => {
            console.log('🟢 تم الاتصال بالسيرفر | Socket ID:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔴 انقطع الاتصال | السبب:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ خطأ في الاتصال:', error.message);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 تم إعادة الاتصال | المحاولة رقم:', attemptNumber);
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('⏳ محاولة إعادة الاتصال رقم:', attemptNumber);
        });

        socket.on('error', (error) => {
            console.error('❗ خطأ في السوكيت:', error);
        });
    }

    return socket;
}

// دالة لقطع الاتصال وتنظيف السوكيت
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('👋 تم قطع الاتصال وتنظيف السوكيت');
    }
}
