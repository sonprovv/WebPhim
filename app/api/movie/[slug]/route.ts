import { NextRequest, NextResponse } from 'next/server';
import { getServerMovieDetail } from '@/lib/server-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<ReturnType<typeof NextResponse.json>> {
  try {
    const { slug } = params;
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
