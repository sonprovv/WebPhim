import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tìm kiếm phim - WebPhim",
  description: "Tìm kiếm phim yêu thích của bạn với nhiều bộ lọc và tùy chọn",
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 