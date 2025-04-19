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
  output: 'export',
  distDir: 'out',
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: 'true'
  },
  // Copy the 404.html file
  exportPathMap: async function (defaultPathMap) {
    return {
      ...defaultPathMap,
    };
  }
};

module.exports = nextConfig;
