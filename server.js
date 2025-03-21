const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const mongoose = require('mongoose');
const cors = require('cors');
const Player = require('./models/Player');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// إعداد المنفذ
const PORT = parseInt(process.env.PORT || '3001', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/street-fighter-tournament';

// اتصال قاعدة البيانات
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);
  
  // إعداد CORS
  app.use(cors());

  // إعداد Socket.IO
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // تهيئة express middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // نقاط نهاية API
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  // تحديث نتيجة المباراة
  app.post('/api/matches/result', async (req, res) => {
    try {
      const { winnerId, loserId } = req.body;

      // تحديث الفائز
      const winner = await Player.findById(winnerId);
      const loser = await Player.findById(loserId);

      if (!winner || !loser) {
        return res.status(404).json({ error: 'لم يتم العثور على اللاعبين' });
      }

      // التحقق من أن كلا اللاعبين في نفس الجولة
      if (winner.currentRound !== loser.currentRound) {
        return res.status(400).json({ error: 'اللاعبان ليسا في نفس الجولة' });
      }

      // التحقق من عدد اللاعبين النشطين في هذه الجولة
      const activePlayers = await Player.countDocuments({
        status: 'active',
        currentRound: winner.currentRound
      });

      winner.wins += 1;
      winner.currentRound += 1;
      winner.inMatch = false;
      winner.matchId = null;

      loser.losses += 1;
      loser.isEliminated = true;
      loser.status = 'eliminated';
      loser.inMatch = false;
      loser.matchId = null;

      // إذا كان هناك لاعبان فقط في الجولة النهائية
      if (activePlayers === 2 && winner.currentRound === 5) {
        winner.status = 'winner';
      }

      await winner.save();
      await loser.save();

      // إرسال تحديث مباشر عبر Socket.IO
      io.emit('matchResult', { winner, loser });

      res.json({ winner, loser });
    } catch (error) {
      console.error('خطأ في تحديث نتيجة المباراة:', error);
      res.status(500).json({ error: 'خطأ في تحديث نتيجة المباراة' });
    }
  });

  // إعادة تعيين البطولة
  app.post('/api/reset', async (req, res) => {
    try {
      await Player.deleteMany({});
      res.json({ message: 'تم إعادة تعيين البطولة بنجاح' });
    } catch (error) {
      res.status(500).json({ error: 'خطأ في إعادة تعيين البطولة' });
    }
  });

  // إضافة لاعب جديد
  app.post('/api/players', async (req, res) => {
    try {
      const { nickname } = req.body;
      const player = new Player({
        nickname,
        status: 'active',
        wins: 0,
        losses: 0,
        isEliminated: false,
        currentRound: 1
      });
      await player.save();
      res.status(201).json(player);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في إضافة اللاعب' });
    }
  });

  // معالجة اتصالات Socket.IO
  io.on('connection', (socket) => {
    console.log('👤 مستخدم جديد متصل:', socket.id);

    socket.on('disconnect', () => {
      console.log('👋 مستخدم انفصل:', socket.id);
    });
  });

  // توجيه كل الطلبات المتبقية إلى Next.js
  app.all('*', (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`
🚀 الخادم يعمل على المنفذ ${PORT}
📱 واجهة المستخدم: http://localhost:${PORT}
🔌 Socket.IO جاهز للاتصال
    `);
  });
}).catch((err) => {
  console.error('❌ خطأ في تشغيل الخادم:', err);
  process.exit(1);
});
