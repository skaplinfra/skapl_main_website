/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'media.licdn.com'
    ],
  },
};

module.exports = nextConfig;
