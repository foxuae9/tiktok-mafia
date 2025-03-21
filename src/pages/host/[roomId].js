import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'

export default function Room() {
  const router = useRouter()
  const { roomId } = router.query
  const [socket, setSocket] = useState(null)
  const [players, setPlayers] = useState([])
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  // إعداد الاتصال بالسوكيت
  useEffect(() => {
    if (!roomId) return

    const newSocket = io({
      path: '/api/socket',
      addTrailingSlash: false
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
      setError(null)
      
      // الانضمام للغرفة عند الاتصال
      const username = localStorage.getItem('username') || 'زائر'
      newSocket.emit('join-room', { roomId, username })
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    newSocket.on('error', (data) => {
      console.error('Error:', data.message)
      setError(data.message)
    })

    newSocket.on('players-update', (data) => {
      console.log('Players updated:', data.players)
      setPlayers(data.players)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [roomId])

  // نسخ رمز الغرفة
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    alert('تم نسخ رمز الغرفة')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            غرفة {roomId}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {connected ? 'متصل' : 'غير متصل'}
            </span>
          </div>
        </div>

        {/* قائمة اللاعبين */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              اللاعبين ({players.length}/8)
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">
                      {player.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{player.username}</p>
                    <p className="text-sm text-gray-500">
                      {player.isHost ? 'مضيف' : 'لاعب'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex justify-center gap-4">
          <button
            onClick={copyRoomId}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            نسخ رمز الغرفة
          </button>
        </div>
      </div>
    </div>
  )
}
