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
      // Thêm rule mới để proxy video
      {
        source: '/api/video/:path*',
        destination: 'https://s4.phim1280.tv/:path*',
      },
    ];
  },
  images: {
    domains: ['phimimg.com'],
  },
  optimizeFonts: true,
  swcMinify: true,
};

module.exports = nextConfig;