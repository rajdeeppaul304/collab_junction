"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, User, Menu, X } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (isLoaded && user) {
      setUserRole(user.publicMetadata?.role || null)
    }
  }, [isLoaded, user])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="py-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#111] rounded-full px-6 py-3 flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-yellow-400">
              Home
            </Link>
            {userRole && (
              <Link href="/dashboard" className="text-white hover:text-yellow-400">
                Dashboard
              </Link>
            )}
            <Link href="/store" className="text-white hover:text-yellow-400">
              Store
            </Link>
          </div>

          <Link href="/" className="text-white">
            <div className="flex items-center">
              <span className="text-white font-bold text-xl">COLLAB</span>
              <span className="mx-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22L3.5 14L7 10.5L12 15.5L17 10.5L20.5 14L12 22Z" fill="white" />
                  <path d="M12 13L3.5 5L7 1.5L12 6.5L17 1.5L20.5 5L12 13Z" fill="white" />
                </svg>
              </span>
              <span className="text-white font-bold text-xl">JUNCTION</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="text-white hover:text-yellow-400">
              About
            </Link>
            {isLoaded ? (
              user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/store" className="text-white hover:text-yellow-400">
                    <ShoppingBag className="h-5 w-5" />
                  </Link>
                  <Link href="/profile" className="text-white hover:text-yellow-400">
                    <User className="h-5 w-5" />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button asChild variant="ghost" className="text-white hover:text-yellow-400">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </div>
              )
            ) : (
              <div className="h-9 w-20 bg-[#222] rounded-md animate-pulse"></div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#111] mt-2 rounded-xl p-4 space-y-3">
            <Link href="/" className="block text-white hover:text-yellow-400 py-2">
              Home
            </Link>
            {userRole && (
              <Link href="/dashboard" className="block text-white hover:text-yellow-400 py-2">
                Dashboard
              </Link>
            )}
            <Link href="/store" className="block text-white hover:text-yellow-400 py-2">
              Store
            </Link>
            <Link href="/about" className="block text-white hover:text-yellow-400 py-2">
              About
            </Link>
            {isLoaded && user ? (
              <>
                <Link href="/profile" className="block text-white hover:text-yellow-400 py-2">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="block text-white hover:text-yellow-400 py-2">
                  Sign In
                </Link>
                <Link href="/sign-up" className="block text-white hover:text-yellow-400 py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
