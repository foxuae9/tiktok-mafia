const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // تقدر تحدد رابط موقعك لاحقًا
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 عميل جديد متصل!");

  socket.on("disconnect", () => {
    console.log("🔌 العميل فصل الاتصال");
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على المنفذ ${PORT}`);
});
