import { Server } from 'socket.io'

const rooms = new Map()

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    res.end()
    return
  }

  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // إنشاء غرفة جديدة
    socket.on('create-room', ({ username }) => {
      try {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
        const room = {
          id: roomId,
          host: socket.id,
          players: [{
            id: socket.id,
            username,
            isHost: true
          }]
        }
        
        rooms.set(roomId, room)
        socket.join(roomId)
        socket.emit('room-created', { roomId })
        
        // إرسال تحديث اللاعبين
        io.to(roomId).emit('players-update', {
          players: room.players
        })
        
        console.log(`Room ${roomId} created by ${username}`)
      } catch (error) {
        console.error('Create room error:', error)
        socket.emit('error', { message: 'فشل في إنشاء الغرفة' })
      }
    })

    // الانضمام إلى غرفة
    socket.on('join-room', ({ roomId, username }) => {
      try {
        const room = rooms.get(roomId)
        
        if (!room) {
          socket.emit('error', { message: 'الغرفة غير موجودة' })
          return
        }

        if (room.players.length >= 8) {
          socket.emit('error', { message: 'الغرفة ممتلئة' })
          return
        }

        // إضافة اللاعب للغرفة
        room.players.push({
          id: socket.id,
          username,
          isHost: false
        })

        socket.join(roomId)
        
        // إرسال تحديث اللاعبين للجميع في الغرفة
        io.to(roomId).emit('players-update', {
          players: room.players
        })

        console.log(`${username} joined room ${roomId}`)
      } catch (error) {
        console.error('Join room error:', error)
        socket.emit('error', { message: 'فشل في الانضمام للغرفة' })
      }
    })

    // مغادرة الغرفة / قطع الاتصال
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      
      // البحث عن الغرفة التي يوجد فيها اللاعب
      for (const [roomId, room] of rooms.entries()) {
        const playerIndex = room.players.findIndex(p => p.id === socket.id)
        
        if (playerIndex !== -1) {
          // إزالة اللاعب من الغرفة
          room.players.splice(playerIndex, 1)
          
          if (room.players.length === 0) {
            // إذا لم يتبق لاعبين، احذف الغرفة
            rooms.delete(roomId)
          } else {
            // إذا كان اللاعب المغادر هو المضيف، قم بتعيين مضيف جديد
            if (socket.id === room.host) {
              room.host = room.players[0].id
              room.players[0].isHost = true
            }
            
            // إرسال تحديث اللاعبين
            io.to(roomId).emit('players-update', {
              players: room.players
            })
          }
          break
        }
      }
    })
  })

  res.socket.server.io = io
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}
