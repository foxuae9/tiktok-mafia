import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import Head from 'next/head'

export default function NewRoom() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const username = localStorage.getItem('username')
    if (!username) {
      router.replace('/')
      return
    }

    const initSocket = async () => {
      try {
        console.log('Connecting to socket server...')
        const socketUrl = window.location.origin
        const socket = io(socketUrl, {
          path: '/api/socket',
          addTrailingSlash: false,
          transports: ['polling', 'websocket'],
          reconnectionAttempts: 5,
          timeout: 10000
        })

        socket.on('connect', () => {
          console.log('Connected to socket')
          socket.emit('create-room', { username })
        })

        socket.on('connect_error', (error) => {
          console.error('Connection error:', error)
          setError('حدث خطأ في الاتصال بالخادم')
        })

        socket.on('room-created', ({ roomId }) => {
          console.log('Room created:', roomId)
          router.push(`/host/${roomId}`)
        })

        socket.on('error', ({ message }) => {
          console.error('Socket error:', message)
          setError(message)
        })

        return () => {
          socket.disconnect()
        }

      } catch (error) {
        console.error('Failed to connect:', error)
        setError('حدث خطأ في الاتصال بالخادم')
      }
    }

    initSocket()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <Head>
        <title>إنشاء غرفة جديدة - FOXUAE35</title>
      </Head>
      
      <div className="text-center">
        {error ? (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-500 text-lg" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              style={{ fontFamily: 'Tajawal, sans-serif' }}
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl text-white mb-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              جاري إنشاء الغرفة...
            </h2>
            <p className="text-gray-400" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              يرجى الانتظار
            </p>
          </>
        )}
      </div>
    </div>
  )
}
