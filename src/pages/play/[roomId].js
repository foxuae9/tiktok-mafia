import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import Head from 'next/head'

export default function PlayRoom() {
  const router = useRouter()
  const { roomId } = router.query
  const [role, setRole] = useState(null)
  const [players, setPlayers] = useState([])
  const [error, setError] = useState('')
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [gameStatus, setGameStatus] = useState('waiting')
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (!roomId) return

    // استرجاع اسم المستخدم من التخزين المحلي
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) {
      setUsername(storedUsername)
    } else {
      // إذا لم يكن هناك اسم مستخدم، ارجع للصفحة الرئيسية
      router.replace('/')
      return
    }

    const initSocket = async () => {
      try {
        const socketUrl = window.location.origin
        const newSocket = io(socketUrl, {
          path: '/api/socket',
          addTrailingSlash: false,
          reconnection: true,
          reconnectionAttempts: 5
        })

        newSocket.on('connect', () => {
          console.log('Connected to room:', roomId)
          setIsConnected(true)
          setError('')
          // إعادة الانضمام للغرفة بعد الاتصال
          newSocket.emit('join-room', { roomId, username: storedUsername })
        })

        newSocket.on('player-joined', ({ players: updatedPlayers }) => {
          console.log('Players updated:', updatedPlayers)
          setPlayers(updatedPlayers)
        })

        newSocket.on('game-started', ({ players: updatedPlayers, status }) => {
          console.log('Game started')
          setPlayers(updatedPlayers)
          setGameStatus(status)
        })

        newSocket.on('role-assigned', ({ role: assignedRole }) => {
          console.log('Role assigned:', assignedRole)
          setRole(assignedRole)
        })

        newSocket.on('error', ({ message }) => {
          console.error('Server error:', message)
          setError(message)
          // إذا كانت الغرفة غير موجودة، ارجع للصفحة الرئيسية
          if (message === 'الغرفة غير موجودة' || message === 'الغرفة مغلقة') {
            setTimeout(() => router.replace('/'), 3000)
          }
        })

        newSocket.on('room-closed', ({ message }) => {
          setError(message)
          setTimeout(() => router.replace('/'), 3000)
        })

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err)
          setIsConnected(false)
          setError('حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.')
        })

        setSocket(newSocket)
      } catch (err) {
        console.error('Failed to initialize socket:', err)
        setError('حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.')
      }
    }

    initSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [roomId])

  const getRoleColor = (role) => {
    switch (role) {
      case 'مافيا':
        return 'text-red-600'
      case 'طبيب':
        return 'text-green-600'
      case 'محقق':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRoleEmoji = (role) => {
    switch (role) {
      case 'مافيا':
        return '🔪'
      case 'طبيب':
        return '💉'
      case 'محقق':
        return '🔍'
      default:
        return '👤'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>غرفة {roomId} - لعبة المافيا</title>
      </Head>
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">غرفة {roomId}</h2>
                  {username && (
                    <div className="text-sm text-gray-500">
                      مرحباً، {username}
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                {gameStatus === 'playing' && role && (
                  <div className="mt-6">
                    <div className={`text-center p-6 rounded-lg border-2 ${getRoleColor(role)} bg-opacity-10`}>
                      <div className="text-4xl mb-2">{getRoleEmoji(role)}</div>
                      <h3 className={`text-xl font-bold ${getRoleColor(role)}`}>
                        دورك: {role}
                      </h3>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">اللاعبون:</h3>
                    <span className="text-sm text-gray-500">
                      {players.length} / 8 لاعبين
                    </span>
                  </div>
                  {players.length > 0 ? (
                    <ul className="space-y-2">
                      {players.map((player, index) => (
                        <li 
                          key={player.id} 
                          className={`p-3 bg-gray-50 rounded-lg flex justify-between items-center ${
                            player.username === username ? 'border-2 border-blue-200' : ''
                          }`}
                        >
                          <span>{player.username}</span>
                          {index === 0 && (
                            <span className="text-sm text-blue-500 font-medium">المضيف</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
                      لا يوجد لاعبون حتى الآن
                    </p>
                  )}
                </div>

                {gameStatus === 'waiting' && (
                  <div className="mt-6">
                    <div className="text-center p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                      في انتظار بدء اللعبة...
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-gray-500">
                      {isConnected ? 'متصل' : 'غير متصل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
