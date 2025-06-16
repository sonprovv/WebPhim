/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/danh-sach/:path*',
        destination: 'https://phimapi.com/v1/api/danh-sach/:path*',
      },
      {
        source: '/api/phim/:path*',
        destination: 'https://phimapi.com/phim/:path*',
      },
      {
        source: '/api/the-loai/:path*',
        destination: 'https://phimapi.com/the-loai/:path*',
      },
      {
        source: '/api/quoc-gia/:path*',
        destination: 'https://phimapi.com/v1/api/quoc-gia/:path*',
      },
      {
        source: '/api/nam/:path*',
        destination: 'https://phimapi.com/v1/api/nam/:path*',
      },
      {
        source: '/api/tim-kiem',
        destination: 'https://phimapi.com/v1/api/tim-kiem',
      },
    ];
  },
  images: {
    domains: ['phimimg.com'],
  },
};

module.exports = nextConfig;