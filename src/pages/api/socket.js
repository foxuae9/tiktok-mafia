import { Server } from 'socket.io'

// تخزين الغرف خارج الدالة للحفاظ عليها
const rooms = new Map()

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Setting up socket')
  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })
  
  res.socket.server.io = io

  // توزيع الأدوار
  const assignRoles = (players) => {
    const roles = []
    const totalPlayers = players.length
    
    // تحديد عدد اللاعبين في كل دور
    const mafiaCount = Math.floor(totalPlayers / 4) // ربع اللاعبين مافيا
    const doctorCount = 1
    const detectiveCount = 1
    const civilianCount = totalPlayers - mafiaCount - doctorCount - detectiveCount

    // إضافة الأدوار إلى المصفوفة
    for (let i = 0; i < mafiaCount; i++) roles.push('مافيا')
    for (let i = 0; i < doctorCount; i++) roles.push('طبيب')
    for (let i = 0; i < detectiveCount; i++) roles.push('محقق')
    for (let i = 0; i < civilianCount; i++) roles.push('مواطن')

    // خلط الأدوار عشوائياً
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]]
    }

    // توزيع الأدوار على اللاعبين
    return players.map((player, index) => ({
      ...player,
      role: roles[index]
    }))
  }

  io.on('connection', socket => {
    console.log('Client connected:', socket.id)

    // إرسال قائمة الغرف المتاحة للاعب الجديد
    socket.emit('rooms-list', Array.from(rooms.entries()).map(([id, room]) => ({
      id,
      players: room.players.length,
      status: room.status
    })))

    socket.on('create-room', ({ username }) => {
      try {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
        console.log('Creating room:', roomId, 'for user:', username)
        
        const room = {
          host: socket.id,
          players: [{ id: socket.id, username, role: null }],
          status: 'waiting'
        }
        
        rooms.set(roomId, room)
        socket.join(roomId)
        socket.emit('room-created', { roomId })
        io.to(roomId).emit('player-joined', { players: room.players })
        
        // إرسال تحديث لجميع اللاعبين عن الغرفة الجديدة
        io.emit('room-added', { 
          id: roomId, 
          players: 1, 
          status: 'waiting' 
        })
        
        console.log('Room created successfully:', roomId)
      } catch (error) {
        console.error('Error creating room:', error)
        socket.emit('error', { message: 'حدث خطأ في إنشاء الغرفة' })
      }
    })

    socket.on('join-room', ({ roomId, username }) => {
      try {
        const room = rooms.get(roomId)
        if (!room) {
          socket.emit('error', { message: 'الغرفة غير موجودة' })
          return
        }
        
        if (room.status !== 'waiting') {
          socket.emit('error', { message: 'الغرفة مغلقة' })
          return
        }
        
        if (room.players.length >= 8) {
          socket.emit('error', { message: 'الغرفة ممتلئة' })
          return
        }

        // التحقق من عدم وجود نفس الاسم في الغرفة
        if (room.players.some(p => p.username === username)) {
          socket.emit('error', { message: 'هذا الاسم مستخدم في الغرفة' })
          return
        }

        const player = { id: socket.id, username, role: null }
        room.players.push(player)
        socket.join(roomId)
        io.to(roomId).emit('player-joined', { players: room.players })

        // إرسال تحديث لجميع اللاعبين عن عدد اللاعبين في الغرفة
        io.emit('room-updated', { 
          id: roomId, 
          players: room.players.length, 
          status: room.status 
        })

        console.log('Player joined room:', roomId)
      } catch (error) {
        console.error('Error joining room:', error)
        socket.emit('error', { message: 'حدث خطأ في الانضمام للغرفة' })
      }
    })

    socket.on('start-game', ({ roomId }) => {
      try {
        const room = rooms.get(roomId)
        if (room && room.status === 'waiting' && socket.id === room.host) {
          if (room.players.length < 4) {
            socket.emit('error', { message: 'يجب أن يكون هناك 4 لاعبين على الأقل لبدء اللعبة' })
            return
          }

          // توزيع الأدوار
          const playersWithRoles = assignRoles(room.players)
          room.players = playersWithRoles
          room.status = 'playing'

          // إرسال الأدوار لكل لاعب بشكل خاص
          room.players.forEach(player => {
            io.to(player.id).emit('role-assigned', { role: player.role })
          })

          // إرسال قائمة اللاعبين المحدثة للجميع (بدون إظهار الأدوار)
          const publicPlayers = room.players.map(p => ({
            ...p,
            role: p.role ? 'hidden' : null
          }))
          
          io.to(roomId).emit('game-started', { 
            players: publicPlayers,
            status: 'playing'
          })

          // إرسال تحديث لجميع اللاعبين عن حالة الغرفة
          io.emit('room-updated', { 
            id: roomId, 
            players: room.players.length, 
            status: 'playing' 
          })

          console.log('Game started in room:', roomId)
        }
      } catch (error) {
        console.error('Error starting game:', error)
        socket.emit('error', { message: 'حدث خطأ في بدء اللعبة' })
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      
      // البحث عن الغرفة التي كان فيها اللاعب
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.id === socket.id)
        if (playerIndex !== -1) {
          // إذا كان المضيف، احذف الغرفة
          if (socket.id === room.host) {
            rooms.delete(roomId)
            io.emit('room-removed', { id: roomId })
            io.to(roomId).emit('room-closed', { message: 'تم إغلاق الغرفة لخروج المضيف' })
          } else {
            // إذا كان لاعباً عادياً، احذفه من القائمة
            room.players.splice(playerIndex, 1)
            io.to(roomId).emit('player-joined', { players: room.players })
            io.emit('room-updated', { 
              id: roomId, 
              players: room.players.length, 
              status: room.status 
            })
          }
        }
      })
    })
  })

  res.end()
}

export default SocketHandler
