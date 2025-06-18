"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SearchForm({ searchParams }: { searchParams: { q?: string; type?: string; year?: string } }) {
  return (
    <form className="flex flex-col md:flex-row gap-4 bg-zinc-900 p-4 rounded-lg">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Nhập tên phim, diễn viên..."
            className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
            defaultValue={searchParams.q}
            name="q"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <Select name="type" defaultValue={searchParams.type || "all"}>
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Thể loại" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="movie">Phim lẻ</SelectItem>
            <SelectItem value="series">Phim bộ</SelectItem>
          </SelectContent>
        </Select>
        <Select name="year" defaultValue={searchParams.year || "all"}>
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Năm phát hành" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">Tất cả</SelectItem>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="bg-primary hover:bg-primary/90">Tìm kiếm</Button>
      </div>
    </form>
  )
} 