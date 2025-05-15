"use client"

import Link from "next/link"
import { useState } from "react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="py-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#111] rounded-full px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-white hover:text-yellow-400">
            Dashboard
          </Link>
          <Link href="/store" className="text-white hover:text-yellow-400">
            Store
          </Link>
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
          <Link href="/profile" className="text-white hover:text-yellow-400">
            Profile
          </Link>
          <Link href="/about" className="text-white hover:text-yellow-400">
            About
          </Link>
        </div>
      </div>
    </header>
  )
}
