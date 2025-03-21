import { io } from "socket.io-client";

// الاتصال بالسيرفر على Render بدون أي مسار إضافي
const socket = io("https://tiktok-mafia-1.onrender.com", {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
