"use client"

import { useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useAuth } from "../../context/AuthContext"

const MainLayout = ({ children }) => {
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()

  // Don't show navbar on auth pages
  const isAuthPage = pathname === "/signin" || pathname === "/signup"

  return (
    <div className="min-h-screen flex flex-col bg-[#171717] text-white">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

export default MainLayout
