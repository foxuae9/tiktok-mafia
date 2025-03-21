const { io } = require("socket.io-client");

// قائمة أسماء عربية عشوائية
const arabicNames = [
    "غزلان", "نورة", "سارة", "فاطمة", "ريم",
    "عبدالله", "محمد", "أحمد", "خالد", "سلطان"
];

// قائمة تعليقات عربية عشوائية
const arabicComments = [
    "السلام عليكم 👋",
    "ما شاء الله 🌟",
    "البث حلو 🎉",
    "أحسنت ❤️",
    "مرحبا الجميع 😊",
    "تستاهل لايك 👍",
    "استمر 🚀",
    "ابداع 💫",
    "رهيب 🔥",
    "عجبني البث 💎"
];

// إنشاء اتصال Socket.IO
const socket = io("https://tiktok-mafia-server.onrender.com", {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

// معالجة الاتصال
socket.on("connect", () => {
    console.log("✅ تم الاتصال بالسيرفر");

    // إرسال تعليق وهمي كل 3 ثواني
    let count = 1;
    setInterval(() => {
        const comment = {
            userId: arabicNames[Math.floor(Math.random() * arabicNames.length)],
            text: arabicComments[Math.floor(Math.random() * arabicComments.length)],
            timestamp: new Date().toISOString()
        };

        console.log(`💬 إرسال تعليق #${count}:`,
            `[${comment.userId}]`,
            comment.text
        );

        socket.emit("tiktok-comment", comment);
        count++;
    }, 3000);
});

// معالجة الأخطاء
socket.on("connect_error", (error) => {
    console.log("❌ خطأ في الاتصال:", error.message);
});

socket.on("disconnect", () => {
    console.log("❌ انقطع الاتصال");
});

// معالجة إنهاء البرنامج
process.on("SIGINT", () => {
    console.log("\n👋 جاري إغلاق الاتصال...");
    socket.disconnect();
    process.exit();
});
