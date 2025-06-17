"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { api, MOVIE_TYPES } from "@/lib/api"

const menuItems = [
  { label: "Phim Mới", href: "/" },
  { label: "Phim Bộ", href: `/danh-sach/${MOVIE_TYPES[0]}` },
  { label: "Phim Lẻ", href: `/danh-sach/${MOVIE_TYPES[1]}` },
  { label: "TV Shows", href: `/danh-sach/${MOVIE_TYPES[2]}` },
  { label: "Hoạt Hình", href: `/danh-sach/${MOVIE_TYPES[3]}` },

]

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const fetchedCategories = await api.getCategories();
        console.log('Raw fetched categories:', JSON.stringify(fetchedCategories, null, 2));
        
        if (isMounted) {
          if (fetchedCategories && fetchedCategories.length > 0) {
            console.log('Setting categories:', JSON.stringify(fetchedCategories, null, 2));
            setCategories(fetchedCategories);
          } else {
            console.warn('No categories fetched or empty response');
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white">
            PhimHay
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="text-gray-300 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {/* Categories Dropdown */}
            <div className="relative group">
              <button 
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                Xem thêm
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoriesOpen && (
                <div 
                  className="absolute left-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                  <div className="py-1">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/the-loai/${category.slug}`}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 border-gray-800">
              <div className="flex flex-col space-y-4 mt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Tìm kiếm phim..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                  <Button type="submit" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors py-2"
                      onClick={() => setIsOpen(false)}
                    >
                  
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Thể Loại</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.slice(0, 10).map((category) => (
                        <Link
                          key={category.id}
                          href={`/the-loai/${category.slug}`}
                          className="text-sm text-gray-300 hover:text-white transition-colors py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                    {categories.length > 10 && (
                      <Link 
                        href="/the-loai"
                        className="text-sm text-blue-400 hover:underline mt-2 inline-block"
                        onClick={() => setIsOpen(false)}
                      >
                        Xem tất cả thể loại
                      </Link>
                    )}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
