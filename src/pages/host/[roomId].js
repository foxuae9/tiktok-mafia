import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import Head from 'next/head'

export default function HostRoom() {
  const router = useRouter()
  const { roomId } = router.query
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
          console.log('Connected to socket')
          setIsConnected(true)
          setError('')
          // إعادة الانضمام للغرفة بعد الاتصال
          newSocket.emit('create-room', { username: storedUsername })
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

        newSocket.on('error', ({ message }) => {
          console.error('Server error:', message)
          setError(message)
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

  const startGame = () => {
    if (!socket || !isConnected) {
      setError('لا يمكن بدء اللعبة. يرجى التحقق من اتصالك بالإنترنت.')
      return
    }

    if (players.length < 4) {
      setError('يجب أن يكون هناك 4 لاعبين على الأقل لبدء اللعبة')
      return
    }

    socket.emit('start-game', { roomId })
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        // يمكنك إضافة إشعار هنا إذا أردت
        console.log('Room ID copied!')
      })
      .catch(err => {
        console.error('Failed to copy:', err)
      })
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

                <div className="mt-4">
                  <button
                    onClick={copyRoomId}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="h-5 w-5 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    نسخ رمز الغرفة
                  </button>
                </div>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
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
                    <button
                      onClick={startGame}
                      disabled={players.length < 4 || !isConnected}
                      className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        players.length < 4 || !isConnected
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                    >
                      {players.length < 4 
                        ? `بحاجة إلى ${4 - players.length} لاعبين إضافيين`
                        : 'ابدأ اللعبة'
                      }
                    </button>
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
