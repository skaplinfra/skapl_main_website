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
  },
  output: 'export',
  // This ensures static assets are copied to the correct location for Firebase Hosting
  distDir: '.firebase/demo/hosting',
};

module.exports = nextConfig;
