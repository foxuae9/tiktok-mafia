import { Server } from 'socket.io'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Setting up socket')
  const io = new Server(res.socket.server)
  res.socket.server.io = io

  const rooms = new Map()

  io.on('connection', socket => {
    console.log('Client connected')

    socket.on('create-room', ({ username }) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
      rooms.set(roomId, {
        host: username,
        players: [],
        gamePhase: 'waiting',
        roles: {}
      })
      socket.join(roomId)
      socket.emit('room-created', { roomId })
    })

    socket.on('join-room', ({ roomId, username }) => {
      const room = rooms.get(roomId)
      if (room && room.gamePhase === 'waiting') {
        room.players.push({
          id: socket.id,
          name: username,
          role: null
        })
        socket.join(roomId)
        io.to(roomId).emit('player-joined', { players: room.players })
      }
    })

    socket.on('disconnect', () => {
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.id === socket.id)
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1)
          io.to(roomId).emit('player-left', { players: room.players })
        }
      })
    })
  })

  res.end()
}

export default SocketHandler
