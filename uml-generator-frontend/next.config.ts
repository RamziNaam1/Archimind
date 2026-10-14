/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Remplace 3001 par ton port Backend
      },
    ];
  },
};

module.exports = nextConfig;
