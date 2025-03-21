/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/socket/:path*',
        destination: '/api/socket'
      }
    ]
  },
  swcMinify: true,
  pageExtensions: ['js', 'jsx'],
  distDir: '.next',
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  },
  env: {
    SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL || 'http://localhost:10000'
  },
  // إعدادات النطاق المخصص
  images: {
    domains: ['www.foxuae35.com']
  }
}

module.exports = nextConfig
