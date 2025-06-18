import { SearchForm } from "./search-form"
import { SearchResults, SearchFilters } from "./search-results"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; year?: string }
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ChevronLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Tìm kiếm phim</h1>
              <p className="text-muted-foreground mt-2">
                Tìm kiếm phim yêu thích của bạn với nhiều bộ lọc và tùy chọn
              </p>
            </div>
          </div>

          <SearchForm searchParams={searchParams} />

          <div className="space-y-6">
            <SearchFilters searchParams={searchParams} />
            <SearchResults searchParams={searchParams} />
          </div>
        </div>
      </div>
    </div>
  )
} 