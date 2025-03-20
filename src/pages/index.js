import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import io from 'socket.io-client'

export default function Home() {
  const router = useRouter()
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [socket, setSocket] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
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
          console.log('Socket connected')
          setError('')
        })

        newSocket.on('room-created', ({ roomId }) => {
          console.log('Room created:', roomId)
          setIsConnecting(false)
          router.push(`/host/${roomId}`)
        })

        newSocket.on('error', ({ message }) => {
          console.error('Server error:', message)
          setError(message)
          setIsConnecting(false)
        })

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err)
          setError('حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.')
          setIsConnecting(false)
        })

        setSocket(newSocket)
      } catch (err) {
        console.error('Failed to initialize socket:', err)
        setError('حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.')
        setIsConnecting(false)
      }
    }

    initSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const createRoom = (e) => {
    e.preventDefault()
    if (!username) {
      setError('الرجاء إدخال اسم المستخدم')
      return
    }
    if (socket) {
      setIsConnecting(true)
      setError('')
      localStorage.setItem('username', username)
      socket.emit('create-room', { username })
    }
  }

  const joinRoom = (e) => {
    e.preventDefault()
    if (!username) {
      setError('الرجاء إدخال اسم المستخدم')
      return
    }
    if (!roomCode) {
      setError('الرجاء إدخال رمز الغرفة')
      return
    }
    if (socket) {
      setIsConnecting(true)
      setError('')
      localStorage.setItem('username', username)
      socket.emit('join-room', { roomId: roomCode.toUpperCase(), username })
      router.push(`/play/${roomCode.toUpperCase()}`)
    }
  }

  const showForm = (type) => {
    if (type === 'create') {
      setShowCreateForm(true)
      setShowJoinForm(false)
    } else {
      setShowJoinForm(true)
      setShowCreateForm(false)
    }
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>TikTok Mafia Game</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold mb-8 text-center">لعبة المافيا</h2>
                
                {!showCreateForm && !showJoinForm && (
                  <div className="space-y-4">
                    <button
                      onClick={() => showForm('create')}
                      className="w-full py-4 px-6 text-xl bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                      إنشاء غرفة جديدة
                    </button>
                    <div className="text-center text-gray-500">- أو -</div>
                    <button
                      onClick={() => showForm('join')}
                      className="w-full py-4 px-6 text-xl bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                    >
                      انضمام لغرفة
                    </button>
                  </div>
                )}

                {(showCreateForm || showJoinForm) && (
                  <>
                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                      </div>
                    )}

                    <form onSubmit={showCreateForm ? createRoom : joinRoom} className="space-y-6">
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">اسم المستخدم</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="mt-1 block w-full text-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-3"
                          placeholder="أدخل اسمك"
                          required
                          disabled={isConnecting}
                        />
                      </div>

                      {showJoinForm && (
                        <div>
                          <label className="block text-lg font-medium text-gray-700 mb-2">رمز الغرفة</label>
                          <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="mt-1 block w-full text-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-3"
                            placeholder="أدخل رمز الغرفة"
                            maxLength={6}
                            required
                            disabled={isConnecting}
                          />
                        </div>
                      )}

                      <div className="pt-4 space-y-2">
                        <button
                          type="submit"
                          disabled={isConnecting}
                          className={`w-full py-3 px-6 text-lg border border-transparent rounded-lg shadow-lg text-white font-medium transition-colors ${
                            showCreateForm
                              ? isConnecting
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                              : isConnecting
                                ? 'bg-green-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {isConnecting
                            ? showCreateForm
                              ? 'جاري الإنشاء...'
                              : 'جاري الانضمام...'
                            : showCreateForm
                              ? 'إنشاء غرفة'
                              : 'انضمام للغرفة'
                          }
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateForm(false)
                            setShowJoinForm(false)
                            setError('')
                          }}
                          className="w-full py-3 px-6 text-lg border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          رجوع
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
