import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import io from 'socket.io-client'

export default function Home() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const initSocket = async () => {
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
        await fetch(`${socketUrl}/api/socket`)
        const newSocket = io(socketUrl, {
          path: '/api/socket',
          addTrailingSlash: false
        })
        
        newSocket.on('connect', () => {
          console.log('Socket connected')
          setError('') // Clear any previous errors
        })

        newSocket.on('room-created', ({ roomId }) => {
          console.log('Room created:', roomId)
          router.push(`/host/${roomId}`)
        })

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err)
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
  }, [])

  const createRoom = () => {
    if (!username) {
      setError('الرجاء إدخال اسم المستخدم')
      return
    }
    if (socket) {
      setError('')
      socket.emit('create-room', { username })
    } else {
      setError('جاري الاتصال بالخادم...')
    }
  }

  const joinRoom = () => {
    if (!username || !roomCode) {
      setError('الرجاء إدخال اسم المستخدم ورمز الغرفة')
      return
    }
    if (socket) {
      setError('')
      socket.emit('join-room', { roomId: roomCode, username })
      router.push(`/play/${roomCode}`)
    } else {
      setError('جاري الاتصال بالخادم...')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
      <Head>
        <title>لعبة المافيا - TikTok Live</title>
        <meta name="description" content="لعبة المافيا للبث المباشر على تيك توك" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">لعبة المافيا</h1>
        
        <div className="max-w-md mx-auto glass-panel">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="أدخل اسمك"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">رمز الغرفة</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="input-field"
                placeholder="أدخل رمز الغرفة"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center p-2 glass-panel">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={joinRoom}
                className="btn-primary w-full"
              >
                انضم للغرفة
              </button>
              
              <button
                onClick={createRoom}
                className="btn-secondary w-full"
              >
                إنشاء غرفة جديدة
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
