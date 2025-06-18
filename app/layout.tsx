import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WebPhim - Xem Phim HD Vietsub",
  description: "Website xem phim online miễn phí với chất lượng HD, phụ đề Việt. Cập nhật phim mới nhất từ Hàn Quốc, Trung Quốc, Nhật Bản, Mỹ...",
  keywords: "xem phim online, phim HD, phim Vietsub, phim Hàn Quốc, phim Trung Quốc",
  generator: 'Next.js',
  icons: {
    icon: '/su4j8oqw.png',
    apple: '/su4j8oqw.png',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://webphim.com',
    title: 'WebPhim - Xem Phim HD Vietsub',
    description: 'Website xem phim online miễn phí với chất lượng HD, phụ đề Việt. Cập nhật phim mới nhất từ Hàn Quốc, Trung Quốc, Nhật Bản, Mỹ...',
    siteName: 'WebPhim',
    images: [
      {
        url: '/su4j8oqw.png',
        width: 1200,
        height: 630,
        alt: 'WebPhim',
      }
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/su4j8oqw.png" />
        <link rel="apple-touch-icon" href="/su4j8oqw.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
