import { io } from "socket.io-client";

// الاتصال بالسيرفر على Render
const socket = io("https://tiktok-mafia-1.onrender.com", {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

// تسجيل أحداث الاتصال
socket.on("connect", () => {
  console.log("🟢 تم الاتصال بالسيرفر!");
});

socket.on("connected", (data) => {
  console.log("✅ تأكيد الاتصال من السيرفر:", data);
});

socket.on("connect_error", (error) => {
  console.error("❌ خطأ في الاتصال:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 تم قطع الاتصال:", reason);
});

export default socket;
