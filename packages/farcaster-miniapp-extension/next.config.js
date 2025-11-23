/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['jokerace.io', 'imagedelivery.net'],
  },
  async rewrites() {
    return [
      {
        source: '/contest/:chain/:address',
        destination: '/contest/:chain/:address',
      },
    ];
  },
};

module.exports = nextConfig;
