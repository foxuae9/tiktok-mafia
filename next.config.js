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
        source: '/api/socket',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true }
    return config
  }
}

module.exports = nextConfig
