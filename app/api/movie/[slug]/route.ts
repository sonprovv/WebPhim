import { NextRequest, NextResponse } from 'next/server';
import { getServerMovieDetail } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  // Lấy slug từ URL
  const url = new URL(request.url);
  const paths = url.pathname.split('/');
  const slug = paths[paths.length - 1];

  try {
    const data = await getServerMovieDetail(slug);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Internal Server Error',
        status: false,
        msg: error.message || 'Có lỗi xảy ra khi tải dữ liệu phim'
      },
      { status: error.status || 500 }
    );
  }
}
