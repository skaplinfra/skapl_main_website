/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
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
  output: 'export',
  distDir: 'out',
  trailingSlash: true
};

module.exports = nextConfig;
