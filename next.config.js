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
};

// Only enable static export for production builds or when explicitly requested
const isStaticExport = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

if (isStaticExport) {
  console.log('Static export mode enabled');
  nextConfig.output = 'export';
  nextConfig.distDir = 'out';
  nextConfig.trailingSlash = true;
} else {
  console.log('Development mode with API routes enabled');
}

module.exports = nextConfig;
