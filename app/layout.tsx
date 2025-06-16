import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PhimAPI - Xem Phim Online Miễn Phí",
  description:
    "Website xem phim online miễn phí với chất lượng HD, phụ đề Việt. Cập nhật phim mới nhất từ Hàn Quốc, Trung Quốc, Nhật Bản, Mỹ...",
  keywords: "xem phim online, phim HD, phim Vietsub, phim Hàn Quốc, phim Trung Quốc",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
