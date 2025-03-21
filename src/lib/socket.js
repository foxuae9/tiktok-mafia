import { io } from 'socket.io-client';

// تهيئة الاتصال بالسيرفر
const socket = io('https://tiktok-mafia-1.onrender.com', {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// الاستماع لأحداث الاتصال
socket.on('connect', () => {
    console.log('🟢 تم الاتصال بالسيرفر');
    console.log('🆔 معرف الاتصال:', socket.id);
});

// الاستماع لأحداث قطع الاتصال
socket.on('disconnect', (reason) => {
    console.log('🔴 انقطع الاتصال بالسيرفر');
    console.log('❓ السبب:', reason);
});

// الاستماع لأخطاء الاتصال
socket.on('connect_error', (error) => {
    console.error('⚠️ خطأ في الاتصال:', error.message);
});

// الاستماع لمحاولات إعادة الاتصال
socket.on('reconnecting', (attemptNumber) => {
    console.log('🔄 محاولة إعادة الاتصال رقم:', attemptNumber);
});

// تصدير الاتصال لاستخدامه في بقية التطبيق
export default socket;

// دوال مساعدة للتعامل مع الغرف
export const createRoom = (username) => {
    socket.emit('create-room', { username });
};

export const joinRoom = (roomId, username) => {
    socket.emit('join-room', { roomId, username });
};
