import axios from "axios";

const BASE_URL = "https://phimapi.com";

// Define API endpoints
const ENDPOINTS = {
  LATEST: "/danh-sach/phim-moi-cap-nhat",
  MOVIES: "/v1/api/danh-sach",
  DETAIL: "/phim",
  SEARCH: "/v1/api/tim-kiem",
  CATEGORIES: "/the-loai",
  COUNTRIES: "/quoc-gia",
  CATEGORY: "/v1/api/the-loai",
  COUNTRY: "/v1/api/quoc-gia",
  YEAR: "/v1/api/nam",
} as const;

// Define valid type_list options
export const MOVIE_TYPES = [
  'phim-bo',
  'phim-le',
  'tv-shows',
  'hoat-hinh',
  'phim-vietsub',
  'phim-thuyet-minh',
  'phim-long-tieng'
] as const;

export type MovieType = typeof MOVIE_TYPES[number];

// Interfaces (unchanged)
export interface MovieListParams {
  page?: number;
  sort_field?: "modified.time" | "_id" | "year";
  sort_type?: "asc" | "desc";
  sort_lang?: "vietsub" | "thuyet-minh" | "long-tieng";
  category?: string;
  country?: string;
  year?: number;
  limit?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
}

export interface ServerData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface Episode {
  server_name: string;
  server_data: ServerData[];
}

export interface Server {
  server_name: string;
  server_data: ServerData[];
}

export interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  content?: string;
  type?: string;
  status?: string;
  thumb_url: string;
  poster_url: string;
  is_copyright?: boolean;
  sub_docquyen?: boolean;
  chieurap?: boolean;
  trailer_url?: string;
  time?: string;
  episode_current?: string;
  episode_total?: string;
  quality?: string;
  lang?: string;
  notify?: string;
  showtimes?: string;
  slug: string;
  year: number;
  view?: number;
  actor?: string[];
  director?: string[];
  category?: Category[];
  country?: Country[];
  episodes?: Episode[];
}

export interface MovieDetailResponse {
  status: boolean;
  msg: string;
  movie: Movie;
  episodes: Server[];
}

export interface MoviesResponse {
  status: string | boolean;
  msg: string;
  data: {
    items: Movie[];
    params: {
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    };
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface CategoryMovieResponse {
  status: string;
  msg: string;
  data: {
    seoOnPage: {
      og_type: string;
      titleHead: string;
      descriptionHead: string;
      og_image: string[];
      og_url: string;
    };
    breadCrumb: Array<{
      name: string;
      slug: string;
      isCurrent: boolean;
      position: number;
    }>;
    titlePage: string;
    items: Movie[];
    params: {
      type_slug: string;
      slug: string;
      filterCategory: string[];
      filterCountry: string[];
      filterYear: string[];
      filterType: string[];
      sortField: string;
      sortType: string;
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    };
    type_list: string;
    APP_DOMAIN_FRONTEND: string;
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

// API functions with retry and timeout
export const getLatestMovies = async (params: MovieListParams = { page: 1 }): Promise<MoviesResponse> => {
  const url = `${BASE_URL}${ENDPOINTS.LATEST}`;
  try {
    const response = await axios.get(url, {
      params: { ...params, limit: params.limit || 20 },
      timeout: 5000,
    });
    if (!response.data?.items) {
      throw new Error("Không có dữ liệu phim mới");
    }
    return {
      status: response.data.status || "success",
      msg: response.data.msg || "OK",
      data: {
        items: response.data.items,
        params: {
          pagination: response.data.pagination || {
            totalItems: response.data.items.length,
            totalItemsPerPage: params.limit || 20,
            currentPage: params.page || 1,
            totalPages: Math.ceil(response.data.items.length / (params.limit || 20)),
          },
        },
        APP_DOMAIN_CDN_IMAGE: response.data.APP_DOMAIN_CDN_IMAGE || "https://phimimg.com",
      },
    };
  } catch (error) {
    console.error(`Error fetching latest movies from ${url}:`, error);
    return {
      status: "error",
      msg: "Không thể tải dữ liệu phim mới",
      data: {
        items: [],
        params: { pagination: { totalItems: 0, totalItemsPerPage: 20, currentPage: 1, totalPages: 1 } },
        APP_DOMAIN_CDN_IMAGE: "https://phimimg.com",
      },
    };
  }
};

export const getMovieList = async (
  type: MovieType,
  params: MovieListParams = {}
): Promise<MoviesResponse> => {
  const url = `${BASE_URL}${ENDPOINTS.MOVIES}/${type}`;
  
  const defaultParams = {
    page: 0,
    sort_field: 'modified.time',
    sort_type: 'desc',
    ...params,
  };

  try {
    // console.log(`[getMovieList] Fetching movies for type: ${type}`, { params: defaultParams });

    const response = await axios.get(url, {
      params: defaultParams,
      timeout: 15000,
    });

    // console.log(`[getMovieList] Response for ${type}:`, {
    //   data: response.data,
    //   config: {
    //     url: response.config.url,
    //     params: response.config.params,
    //   },
    // });

    if (response.data.status === "error") {
      const errorMessage = response.data.msg || "Lỗi từ API";
      console.error(`[getMovieList] API Error: ${errorMessage}`);
      return {
        status: "error",
        msg: errorMessage,
        data: {
          items: [],
          params: {
            pagination: {
              totalItems: 0,
              totalItemsPerPage: 10,
              currentPage: 0,
              totalPages: 0,
            },
          },
          APP_DOMAIN_CDN_IMAGE: response.data.data?.APP_DOMAIN_CDN_IMAGE || "https://phimimg.com",
        },
      };
    }

    // Process the response data
    const responseData = response.data.data;
    const movies = responseData.items.map((movie: Movie) => ({
      ...movie,
      poster_url: movie.poster_url
        ? (movie.poster_url.startsWith('http') ? movie.poster_url : `${responseData.APP_DOMAIN_CDN_IMAGE}/${movie.poster_url}`.replace(/([^:]\/)\/+/g, '$1'))
        : '/placeholder.jpg',
      thumb_url: movie.thumb_url
        ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : `${responseData.APP_DOMAIN_CDN_IMAGE}/${movie.thumb_url}`.replace(/([^:]\/)\/+/g, '$1'))
        : '/placeholder.jpg',
    }));

    return {
      status: "success",
      msg: response.data.msg || "",
      data: {
        items: movies,
        params: {
          pagination: responseData.params.pagination,
        },
        APP_DOMAIN_CDN_IMAGE: responseData.APP_DOMAIN_CDN_IMAGE,
      },
    };
  } catch (error) {
    console.error(`Error fetching movie list from ${url}:`, error);
    return {
      status: "error",
      msg: error instanceof Error ? error.message : "Không thể tải dữ liệu phim",
      data: {
        items: [],
        params: {
          pagination: {
            totalItems: 0,
            totalItemsPerPage: 10,
            currentPage: 0,
            totalPages: 0,
          },
        },
        APP_DOMAIN_CDN_IMAGE: "https://phimimg.com",
      },
    };
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    // Get categories from the movie list response
    const response = await axios.get(`${BASE_URL}/v1/api/danh-sach/phim-bo`, {
      params: {
        page: 1,
        sort_field: '_id'
      },
      timeout: 5000
    });

    // console.log('API Response:', response.data);

    if (response.data && response.data.status === "success" && response.data.data) {
      // Extract unique categories from the movie items
      const categoriesMap = new Map();
      
      // console.log('Movie items:', response.data.data.items);
      
      response.data.data.items.forEach((movie: any) => {
        // console.log('Movie categories:', movie.category);
        if (movie.category && Array.isArray(movie.category)) {
          movie.category.forEach((cat: any) => {
            if (!categoriesMap.has(cat.id)) {
              categoriesMap.set(cat.id, {
                id: cat.id,
                name: cat.name,
                slug: cat.slug
              });
            }
          });
        }
      });
      
      const categories = Array.from(categoriesMap.values());
      // console.log('Extracted categories:', categories);
      return categories;
    }
    throw new Error("Không có dữ liệu thể loại");
  } catch (error) {
    console.error(`Error fetching categories:`, error);
    return [];
  }
};

// Alias getGenres to getCategories
export const getGenres = getCategories;

export const getCountries = async (): Promise<Country[]> => {
  const url = `${BASE_URL}${ENDPOINTS.COUNTRIES}`;
  try {
    const response = await axios.get(url, { timeout: 5000 });
    if (Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        slug: item.slug,
      }));
    }
    throw new Error("Không có dữ liệu quốc gia");
  } catch (error) {
    console.error(`Error fetching countries from ${url}:`, error);
    return [];
  }
};

export const getMovieDetail = async (slug: string): Promise<MovieDetailResponse> => {
  try {
    const response = await fetch(`/api/phim/${slug}`, { // Sử dụng endpoint rewrite từ next.config.js
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Có lỗi xảy ra khi tải chi tiết phim");
    }

    const data: MovieDetailResponse = await response.json();

    if (!data.status) {
      throw new Error(data.msg || "Không tìm thấy phim");
    }

    return data;
  } catch (error: any) {
    console.error("Lỗi khi tải chi tiết phim:", error);
    throw new Error(
      error.message || "Có lỗi xảy ra khi tải chi tiết phim. Vui lòng thử lại sau."
    );
  }
};

export const searchMovies = async (keyword: string, params: MovieListParams = {}): Promise<MoviesResponse> => {
  const url = `${BASE_URL}${ENDPOINTS.SEARCH}`;
  try {
    const response = await axios.get(url, {
      params: { keyword, ...params, limit: params.limit || 20 },
      timeout: 5000,
    });
    if (!response.data?.data?.items) {
      throw new Error("Không tìm thấy phim");
    }
    return response.data;
  } catch (error) {
    console.error(`Error searching movies from ${url}:`, error);
    return {
      status: "error",
      msg: "Không thể tìm thấy phim",
      data: {
        items: [],
        params: { pagination: { totalItems: 0, totalItemsPerPage: 20, currentPage: 1, totalPages: 1 } },
        APP_DOMAIN_CDN_IMAGE: "https://phimimg.com",
      },
    };
  }
};

// lib/api.ts (phần liên quan)
export const getMoviesByCountry = async (slug: string, params: MovieListParams = {}): Promise<MoviesResponse> => {
  const url = `${BASE_URL}${ENDPOINTS.COUNTRY}/${slug}`;
  try {
    const response = await axios.get(url, {
      params: { ...params, limit: params.limit || 20 },
      timeout: 5000,
    });
    if (!response.data?.data?.items) {
      throw new Error("Không có dữ liệu phim");
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching movies by country from ${url}:`, error);
    return {
      status: "error",
      msg: "Không thể tải dữ liệu phim theo quốc gia",
      data: {
        items: [],
        params: { pagination: { totalItems: 0, totalItemsPerPage: 20, currentPage: 1, totalPages: 1 } },
        APP_DOMAIN_CDN_IMAGE: "https://phimimg.com",
      },
    };
  }
};

export const getMoviesByYear = async (year: number, params: MovieListParams = {}): Promise<MoviesResponse> => {
  const url = `${BASE_URL}${ENDPOINTS.YEAR}/${year}`;
  try {
    const response = await axios.get(url, {
      params: { ...params, limit: params.limit || 20 },
      timeout: 5000,
    });
    if (!response.data?.data?.items) {
      throw new Error("Không có dữ liệu phim");
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching movies by year from ${url}:`, error);
    return {
      status: "error",
      msg: "Không thể tải dữ liệu phim theo năm",
      data: {
        items: [],
        params: { pagination: { totalItems: 0, totalItemsPerPage: 20, currentPage: 1, totalPages: 1 } },
        APP_DOMAIN_CDN_IMAGE: "https://phimimg.com",
      },
    };
  }
};

export const getMoviesByCategory = async (
  category: string,
  params: {
    page?: number;
    limit?: number;
    sort_field?: string;
    sort_type?: 'asc' | 'desc';
    sort_lang?: string;
  } = {}
): Promise<CategoryMovieResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('limit', (params.limit || 20).toString());
    queryParams.append('sort_field', params.sort_field || '_id');
    queryParams.append('sort_type', params.sort_type || 'desc');
    if (params.sort_lang) {
      queryParams.append('sort_lang', params.sort_lang);
    }

    // Use the correct endpoint for category movies
    const url = `${BASE_URL}/v1/api/danh-sach/${category}?${queryParams.toString()}`;
    console.log('API URL:', url);

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Failed to fetch movies by category');
    }

    if (data.status === 'error') {
      throw new Error(data.msg || 'API returned an error');
    }

    // Process image URLs
    const cdnImageDomain = data.data.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com';
    data.data.items = data.data.items.map((movie: Movie) => ({
      ...movie,
      poster_url: movie.poster_url
        ? (movie.poster_url.startsWith('http') ? movie.poster_url : `${cdnImageDomain}/${movie.poster_url}`.replace(/([^:]\/)\/+/g, '$1'))
        : '/placeholder.jpg',
      thumb_url: movie.thumb_url
        ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : `${cdnImageDomain}/${movie.thumb_url}`.replace(/([^:]\/)\/+/g, '$1'))
        : '/placeholder.jpg',
    }));

    return data;
  } catch (error) {
    console.error('Error fetching movies by category:', error);
    throw error;
  }
};

export const getMoviesByGenre = async (
  type_list: string,
  params: {
    page?: number;
    sort_field?: string;
    sort_type?: 'asc' | 'desc';
    sort_lang?: string;
  } = {}
): Promise<CategoryMovieResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('sort_field', params.sort_field || '_id');
    queryParams.append('sort_type', params.sort_type || 'desc');
    if (params.sort_lang) {
      queryParams.append('sort_lang', params.sort_lang);
    }

    const url = `${BASE_URL}${ENDPOINTS.CATEGORY}/${type_list}?${queryParams.toString()}`;
    console.log('API URL:', url);

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Failed to fetch movies by genre');
    }

    if (data.status === 'error') {
      throw new Error(data.msg || 'API returned an error');
    }

    // Process image URLs
    const cdnImageDomain = data.data.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com';
    data.data.items = data.data.items.map((movie: Movie) => ({
      ...movie,
      poster_url: movie.poster_url
        ? (movie.poster_url.startsWith('http') ? movie.poster_url : `${cdnImageDomain}/${movie.poster_url}`.replace(/([^:]\/)\/+/g, '$1'))
        : '/placeholder.jpg',
      thumb_url: movie.thumb_url
        ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : `${cdnImageDomain}/${movie.thumb_url}`.replace(/([^:]\/)\/+/g, '$1'))
        : '/placeholder.jpg',
    }));

    return data;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};

// Export API object
export const api = {
  getLatestMovies,
  getMovieList,
  getMovieDetail,
  searchMovies,
  getCategories,
  getCountries,
  getGenres,
  getMoviesByCountry,
  getMoviesByYear,
  getMoviesByCategory,
  getMoviesByGenre,
} as const;

export type Api = typeof api;