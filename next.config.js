/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'media.licdn.com',
      'cdn-images-1.medium.com',
      'miro.medium.com'
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: true
  }
};

module.exports = nextConfig;
