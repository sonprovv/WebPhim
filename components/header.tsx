"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, ChevronDown, Clock } from "lucide-react"
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { api, MOVIE_TYPES } from "@/lib/api"
import { Logo } from "@/components/logo"

interface Category {
  id: string;
  name: string;
  slug: string;
}

const menuItems = [
  { label: "Phim Mới", href: "/" },
  { label: "Phim Bộ", href: `/danh-sach/${MOVIE_TYPES[0]}` },
  { label: "Phim Lẻ", href: `/danh-sach/${MOVIE_TYPES[1]}` },
  { label: "TV Shows", href: `/danh-sach/${MOVIE_TYPES[2]}` },
  { label: "Hoạt Hình", href: `/danh-sach/${MOVIE_TYPES[3]}` },

]

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        // //console.log('Fetching categories...');
        const fetchedCategories = await api.getCategories();
        // //console.log('Raw fetched categories:', JSON.stringify(fetchedCategories, null, 2));
        
        if (isMounted) {
          if (fetchedCategories && fetchedCategories.length > 0) {
            //console.log('Setting categories:', JSON.stringify(fetchedCategories, null, 2));
            setCategories(fetchedCategories);
          } else {
            //console.warn('No categories fetched or empty response');
          }
        }
      } catch (error) {
        //console.error('Error fetching categories:', error);
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
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1 space-x-6">
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

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden ml-auto">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-gray-900 border-r border-gray-800 w-64 p-0 [--radix-dialog-close-display:none]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center h-16 px-4 border-b border-gray-800 justify-between">
                    <Logo />
                    <div className="flex items-center gap-2">
                      <Link href="/tim-kiem">
                        <Button variant="ghost" size="icon">
                          <Search className="h-6 w-6 text-white" />
                          <span className="sr-only">Tìm kiếm</span>
                        </Button>
                      </Link>
                      <SignedIn>
                        <Link href="/lich-su">
                          <Button variant="ghost" size="icon">
                            <Clock className="h-6 w-6 text-white" />
                            <span className="sr-only">Lịch sử xem</span>
                          </Button>
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                      </SignedIn>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-1 p-4">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-300 hover:text-white px-3 py-2 rounded transition-colors text-base font-medium"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    {/* Categories Dropdown (scrollable for mobile) */}
                    <div className="mt-2">
                      <div className="text-gray-400 text-xs uppercase mb-1">Thể loại</div>
                      <div className="max-h-[300px] overflow-y-auto pr-1">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/the-loai/${category.slug}`}
                            className="block px-3 py-2 text-gray-300 hover:text-white rounded transition-colors text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Search, History, Auth Buttons */}
          <div className="flex items-center space-x-2 ml-auto">
            <Link href="/tim-kiem">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Tìm kiếm</span>
              </Button>
            </Link>

            <Link href="/lich-su">
              <Button variant="ghost" size="icon">
                <Clock className="h-5 w-5" />
                <span className="sr-only">Lịch sử xem</span>
              </Button>
            </Link>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  )
}
