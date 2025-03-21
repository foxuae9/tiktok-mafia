const io = require("socket.io-client");
const chalk = require("chalk"); // لتلوين المخرجات في Terminal

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
const socket = io("https://tiktok-mafia-1.onrender.com", {
    transports: ["websocket"]
});

// معالجة الاتصال
socket.on("connect", () => {
    console.log(chalk.green("✅ تم الاتصال بالسيرفر"));

    // إرسال تعليق وهمي كل 3 ثواني
    let count = 1;
    setInterval(() => {
        const comment = {
            userId: arabicNames[Math.floor(Math.random() * arabicNames.length)],
            text: arabicComments[Math.floor(Math.random() * arabicComments.length)],
            timestamp: new Date().toISOString()
        };

        console.log(
            chalk.blue(`💬 إرسال تعليق #${count}:`),
            chalk.yellow(`[${comment.userId}]`),
            comment.text
        );

        socket.emit("tiktok-comment", comment);
        count++;
    }, 3000);
});

// معالجة الأخطاء
socket.on("connect_error", (error) => {
    console.log(chalk.red("❌ خطأ في الاتصال:"), error.message);
});

socket.on("disconnect", () => {
    console.log(chalk.red("❌ انقطع الاتصال"));
});

// معالجة إنهاء البرنامج
process.on("SIGINT", () => {
    console.log(chalk.yellow("\n👋 جاري إغلاق الاتصال..."));
    socket.disconnect();
    process.exit();
});
