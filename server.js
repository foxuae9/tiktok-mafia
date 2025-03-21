const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 عميل جديد متصل");

  socket.on("create-room", (data) => {
    console.log("🔧 إنشاء غرفة:", data);
    // هنا تقدر تخزن معلومات الغرفة حسب منطقك
  });

  socket.on("join-room", (data) => {
    console.log("🚪 انضمام إلى غرفة:", data);
    // منطق الانضمام هنا
  });

  socket.on("disconnect", () => {
    console.log("🔌 عميل فصل الاتصال");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على المنفذ ${PORT}`);
});
