const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "https://www.foxuae35.com",
  credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://www.foxuae35.com",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"] 
});

// تخزين الغرف
const rooms = new Map();

// إضافة نقطة نهاية للتحقق من حالة السيرفر
app.get("/health", (req, res) => {
  res.json({ status: "ok", connections: io.engine.clientsCount });
});

io.on("connection", (socket) => {
  console.log("🟢 عميل جديد متصل!", socket.id);

  // إرسال تأكيد الاتصال للعميل
  socket.emit("connected", { 
    message: "تم الاتصال بالسيرفر بنجاح",
    socketId: socket.id 
  });

  // إنشاء غرفة جديدة
  socket.on("create-room", ({ username }) => {
    try {
      console.log("محاولة إنشاء غرفة جديدة من قبل:", username);
      
      // إنشاء معرف فريد للغرفة
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // إنشاء كائن الغرفة
      const room = {
        id: roomId,
        host: socket.id,
        players: [{
          id: socket.id,
          username,
          isHost: true
        }]
      };
      
      // تخزين الغرفة
      rooms.set(roomId, room);
      
      // إضافة السوكيت إلى الغرفة
      socket.join(roomId);
      
      // إرسال معلومات الغرفة للمضيف
      socket.emit("room-created", { 
        roomId,
        message: "تم إنشاء الغرفة بنجاح"
      });
      
      console.log("🎯 تم إنشاء غرفة جديدة:", roomId);
    } catch (error) {
      console.error("❌ خطأ في إنشاء الغرفة:", error);
      socket.emit("error", { 
        message: "حدث خطأ أثناء إنشاء الغرفة"
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 العميل فصل الاتصال:", socket.id);
    
    // البحث عن الغرفة التي كان فيها العميل
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // إزالة اللاعب من الغرفة
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          // إذا لم يتبق لاعبين، احذف الغرفة
          rooms.delete(roomId);
          console.log("🗑️ تم حذف الغرفة:", roomId);
        } else {
          // إذا كان المغادر هو المضيف، عين مضيف جديد
          if (room.host === socket.id) {
            room.host = room.players[0].id;
            room.players[0].isHost = true;
            console.log("👑 تم تعيين مضيف جديد في الغرفة:", roomId);
          }
        }
        
        // إخطار باقي اللاعبين
        io.to(roomId).emit("players-update", {
          players: room.players
        });
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على المنفذ ${PORT}`);
});
