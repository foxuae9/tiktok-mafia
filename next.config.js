/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['vercel.app'],
    unoptimized: true
  },
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
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/street-fighter-tournament',
    SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL || 'http://localhost:10000'
  }
}

module.exports = nextConfig
