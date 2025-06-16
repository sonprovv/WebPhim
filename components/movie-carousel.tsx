"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Movie {
  slug: string
  name: string
  poster_url: string
  thumb_url: string
  content: string
  year: number
  category: { name: string }[]
}

interface MovieCarouselProps {
  movies: Movie[]
}

export function MovieCarousel({ movies }: MovieCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [movies.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + movies.length) % movies.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length)
  }

  if (!movies.length) return null

  const currentMovie = movies[currentIndex]

  return (
    <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-lg">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentMovie.thumb_url || currentMovie.poster_url || "/placeholder.svg?height=500&width=1200"}
          alt={currentMovie.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">{currentMovie.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-yellow-400 font-semibold">{currentMovie.year}</span>
              <div className="flex space-x-2">
                {currentMovie.category?.slice(0, 3).map((cat, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-300 text-sm lg:text-base mb-6 line-clamp-3">{currentMovie.content}</p>
            <Link href={`/phim/${currentMovie.slug}`}>
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                <Play className="w-5 h-5 mr-2" />
                Xem Ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
        onClick={goToNext}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {movies.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
