import axios from "axios";

const BASE_URL = "https://phimapi.com";

// Define API endpoints
const ENDPOINTS = {
  LATEST: "/danh-sach/phim-moi-cap-nhat",
  MOVIES: "/v1/api/danh-sach",
  DETAIL: "/phim",
  SEARCH: "/tim-kiem",
  CATEGORIES: "/the-loai",
  COUNTRIES: "/quoc-gia",
  CATEGORY: "/v1/api/the-loai",
  COUNTRY: "/v1/api/quoc-gia",
  YEAR: "/v1/api/nam",
} as const;

// Interfaces
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

// API functions with retry and timeout
export const getLatestMovies = async (params: MovieListParams = { page: 1 }): Promise<MoviesResponse> => {
  const url = `${BASE_URL}${ENDPOINTS.LATEST}`;
  try {
    const response = await axios.get(url, {
      params: { ...params, limit: params.limit || 20 },
      timeout: 5000, // Giới hạn 5 giây
    });
    console.log("getLatestMovies response:", JSON.stringify(response.data, null, 2));
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

export const getMovieList = async (type: string, params: MovieListParams = {}): Promise<MoviesResponse> => {
  const url = `${BASE_URL}${ENDPOINTS.MOVIES}/${type}`;
  try {
    const response = await axios.get(url, {
      params: { ...params, limit: params.limit || 20 },
      timeout: 5000,
    });
    console.log("getMovieList response:", JSON.stringify(response.data, null, 2));
    if (!response.data?.data?.items) {
      throw new Error("Không có dữ liệu phim");
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie list from ${url}:`, error);
    return {
      status: "error",
      msg: "Không thể tải dữ liệu phim",
      data: {
        items: [],
        params: { pagination: { totalItems: 0, totalItemsPerPage: 20, currentPage: 1, totalPages: 1 } },
        APP_DOMAIN_CDN_IMAGE: "https://phimimg.com",
      },
    };
  }
};

export const getCategories = async (): Promise<Category[]> => {
  const url = `${BASE_URL}${ENDPOINTS.CATEGORIES}`;
  try {
    const response = await axios.get(url, { timeout: 5000 });
    console.log("getCategories response:", JSON.stringify(response.data, null, 2));
    if (Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        slug: item.slug,
        description: item.description,
      }));
    }
    throw new Error("Không có dữ liệu thể loại");
  } catch (error) {
    console.error(`Error fetching categories from ${url}:`, error);
    return [];
  }
};

// Alias getGenres to getCategories
export const getGenres = getCategories;

export const getCountries = async (): Promise<Country[]> => {
  const url = `${BASE_URL}${ENDPOINTS.COUNTRIES}`;
  try {
    const response = await axios.get(url, { timeout: 5000 });
    console.log("getCountries response:", JSON.stringify(response.data, null, 2));
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
    const response = await fetch(`/api/movie/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Có lỗi xảy ra khi tải chi tiết phim');
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.msg || 'Không tìm thấy phim');
    }
    
    return data;
  } catch (error: any) {
    console.error('Lỗi khi tải chi tiết phim:', error);
    throw new Error(
      error.message || 'Có lỗi xảy ra khi tải chi tiết phim. Vui lòng thử lại sau.'
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
    console.log("searchMovies response:", JSON.stringify(response.data, null, 2));
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
export const getMoviesByCategory = async (
  slug: string,
  params: MovieListParams & {
    sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
    country?: string;
    year?: number;
    sort_field?: '_id' | 'modified.time' | 'year' | 'view';
    sort_type?: 'asc' | 'desc';
  } = {}
): Promise<MoviesResponse> => {
  // Build the base URL with the category slug
  const url = `${BASE_URL}${ENDPOINTS.CATEGORY}/${slug}`;
  
  // Set default parameters
  const defaultParams = {
    page: 1,
    limit: 10,
    sort_field: '_id',
    sort_type: 'asc',
    sort_lang: 'long-tieng',
    ...params
  };

  // Filter out undefined parameters
  const requestParams = Object.fromEntries(
    Object.entries(defaultParams).filter(([_, value]) => value !== undefined)
  );

  try {
    console.log(`[getMoviesByCategory] Fetching movies for category: ${slug}`, { params: requestParams });

    const response = await axios.get<MoviesResponse>(url, {
      params: requestParams,
      paramsSerializer: {
        indexes: null, // Don't use array format like `country[]=trung-quoc`
      },
      timeout: 15000, // 15 seconds timeout
    });

    console.log(`[getMoviesByCategory] Response for ${slug}:`, {
      data: response.data,
      config: {
        url: response.config.url,
        params: response.config.params,
      },
    });
    
    // Check for error status in response
    if (response.data.status === 'error') {
      const errorMessage = response.data.msg || 'Lỗi từ API';
      console.error(`[getMoviesByCategory] API Error: ${errorMessage}`);
      
      // Return a proper error response instead of throwing
      return {
        status: 'error',
        msg: errorMessage,
        data: {
          items: [],
          params: {
            pagination: {
              totalItems: 0,
              totalItemsPerPage: params?.limit || 20,
              currentPage: params?.page || 1,
              totalPages: 0,
            },
          },
          APP_DOMAIN_CDN_IMAGE: process.env.NEXT_PUBLIC_APP_DOMAIN_CDN_IMAGE || '',
        },
      };
    }
    
    // Check if data.items exists
    if (!response.data?.data?.items) {
      console.warn(`[getMoviesByCategory] No items found in response for ${slug}. Response data:`, response.data);
      // Return empty items array with required properties
      return {
        status: 'success',
        msg: 'No movies found for the specified category',
        data: {
          items: [],
          params: {
            pagination: {
              totalItems: 0,
              totalItemsPerPage: params.limit || 20,
              currentPage: params.page || 1,
              totalPages: 0,
            },
          },
          APP_DOMAIN_CDN_IMAGE: process.env.NEXT_PUBLIC_APP_DOMAIN_CDN_IMAGE || '',
        },
      };
    }
    
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi gọi getMoviesByCategory từ ${url}:`, error);
    return {
      status: "error",
      msg: error instanceof Error ? error.message : "Không thể tải dữ liệu phim theo thể loại",
      data: {
        items: [],
        params: { 
          pagination: { 
            totalItems: 0, 
            totalItemsPerPage: params?.limit || 20, 
            currentPage: params?.page || 1, 
            totalPages: 0 
          } 
        },
        APP_DOMAIN_CDN_IMAGE: process.env.NEXT_PUBLIC_APP_DOMAIN_CDN_IMAGE || '',
      },
    };
  }
};

export const getMoviesByCountry = async (slug: string, params: MovieListParams = {}): Promise<MoviesResponse> => {
  const url = `${BASE_URL}${ENDPOINTS.COUNTRY}/${slug}`;
  try {
    const response = await axios.get(url, {
      params: { ...params, limit: params.limit || 20 },
      timeout: 5000,
    });
    console.log("getMoviesByCountry response:", JSON.stringify(response.data, null, 2));
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
    console.log("getMoviesByYear response:", JSON.stringify(response.data, null, 2));
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

// Export API object
export const api = {
  getLatestMovies,
  getMovieList,
  getMovieDetail,
  searchMovies,
  getCategories,
  getCountries,
  getGenres,
  getMoviesByCategory,
  getMoviesByCountry,
  getMoviesByYear,
} as const;

export type Api = typeof api;