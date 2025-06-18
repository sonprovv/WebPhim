import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MovieCard } from "@/components/movie-card"
import { searchMovies } from "@/lib/api"

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-[2/3] w-full" />
          <CardContent className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function SearchResultsContent({ searchParams }: { searchParams: { q?: string; type?: string; year?: string } }) {
  if (!searchParams.q) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">Nhập từ khóa để tìm kiếm</h3>
        <p className="text-sm text-muted-foreground mt-2">Tìm kiếm phim theo tên, diễn viên, thể loại...</p>
      </div>
    )
  }

  const response = await searchMovies(searchParams.q, {
    page: 1,
    limit: 20,
    sort_field: 'modified.time',
    sort_type: 'desc',
    type: searchParams.type === "all" ? undefined : searchParams.type,
    year: searchParams.year === "all" ? undefined : Number(searchParams.year)
  })

  if (!response.data.items.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">Không tìm thấy kết quả phù hợp</h3>
        <p className="text-sm text-muted-foreground mt-2">Vui lòng thử lại với từ khóa khác</p>
      </div>
    )
  }

  let cdnImageDomain = response.data.APP_DOMAIN_CDN_IMAGE;
  // Ensure cdnImageDomain has a protocol
  if (cdnImageDomain && !cdnImageDomain.startsWith('http://') && !cdnImageDomain.startsWith('https://')) {
    cdnImageDomain = `https://${cdnImageDomain}`;
  } else if (!cdnImageDomain) {
    // Fallback if APP_DOMAIN_CDN_IMAGE is empty
    cdnImageDomain = 'https://phimimg.com'; // Use a known default if API doesn't provide
  }

  const movies = response.data.items.map(movie => ({
    ...movie,
    // Only prepend cdnImageDomain if poster_url/thumb_url are not already full URLs
    poster_url: movie.poster_url
      ? (movie.poster_url.startsWith('http') ? movie.poster_url : `${cdnImageDomain}/${movie.poster_url}`.replace(/([^:]\/)\/+/g, '$1'))
      : '/placeholder.jpg',
    thumb_url: movie.thumb_url
      ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : `${cdnImageDomain}/${movie.thumb_url}`.replace(/([^:]\/)\/+/g, '$1'))
      : '/placeholder.jpg',
  }))

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} />
      ))}
    </div>
  )
}

export function SearchResults({ searchParams }: { searchParams: { q?: string; type?: string; year?: string } }) {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchResultsContent searchParams={searchParams} />
    </Suspense>
  )
}

export function SearchFilters({ searchParams }: { searchParams: { q?: string; type?: string; year?: string } }) {
  if (!searchParams.q) return null

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">Kết quả tìm kiếm cho: {searchParams.q}</Badge>
      {searchParams.type && searchParams.type !== "all" && (
        <Badge variant="secondary">Thể loại: {searchParams.type === "movie" ? "Phim lẻ" : "Phim bộ"}</Badge>
      )}
      {searchParams.year && searchParams.year !== "all" && (
        <Badge variant="secondary">Năm: {searchParams.year}</Badge>
      )}
    </div>
  )
} 