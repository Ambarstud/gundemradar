import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // BigPara domain'ini resim kaynağı olarak tanımla (gerekirse)
  images: {
    domains: [],
  },
  // API route'larında dış kaynaklara erişim için
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

export default nextConfig;
