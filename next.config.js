/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
  // إعدادات النطاق المخصص
  images: {
    domains: ['www.foxuae35.com']
  }
}

module.exports = nextConfig
