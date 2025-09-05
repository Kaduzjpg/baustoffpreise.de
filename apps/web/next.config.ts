import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  i18n: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    localeDetection: true
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' }
    ]
  }
};

export default nextConfig;


