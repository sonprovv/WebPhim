import axios from 'axios';

const BASE_URL = 'https://phimapi.com';
const ENDPOINTS = {
  DETAIL: '/phim',
};

export const getServerMovieDetail = async (slug: string) => {
  try {
    const response = await axios.get(`${BASE_URL}${ENDPOINTS.DETAIL}/${slug}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.data) {
      throw new Error('Không nhận được dữ liệu từ máy chủ');
    }

    return response.data;
  } catch (error: any) {
    //console.error('Lỗi khi tải chi tiết phim từ API:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Có lỗi xảy ra khi tải chi tiết phim từ API'
    );
  }
};
