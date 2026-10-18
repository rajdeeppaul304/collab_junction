"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Logo from "../ui/Logo"

const Navbar = () => {
  const { isAuthenticated, userRole, signout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    signout()
    navigate("/")
  }

  // Create array of all navigation items for even distribution
  const getNavItems = () => {
    const items = []

    if (!isAuthenticated) {
      // Signed out: Store, About, Logo (center), Sign In, Sign Up
      items.push(
        <Link key="store" to="/store" className="hover:text-yellow-400 transition-colors">
          Store
        </Link>,
      )
      items.push(
        <Link key="about" to="/about" className="hover:text-yellow-400 transition-colors">
          About
        </Link>,
      )
      items.push(
        <Link key="logo" to="/" className="hover:text-yellow-400 transition-transform hover:scale-105 flex items-center">
          <Logo />
        </Link>,
      )
      items.push(
        <Link key="signin" to="/signin" className="hover:text-yellow-400 transition-colors">
          Sign In
        </Link>,
      )
      items.push(
        <Link
          key="signup"
          to="/signup"
          className="bg-yellow-400 text-black px-5 py-2 rounded-full hover:bg-yellow-300 font-semibold transition-all hover:scale-105 shadow-md text-base lg:text-lg"
        >
          Sign Up
        </Link>,
      )
    } else {
      // Signed in: (Dashboard or Profile), Store, Logo (center), About, Logout
      if (userRole === "BRAND") {
        items.push(
          <Link key="dashboard" to="/dashboard/brand" className="hover:text-yellow-400 transition-colors">
            Dashboard
          </Link>,
        )
        items.push(
          <Link key="manage-products" to="/manage-products" className="hover:text-yellow-400 transition-colors">
            Manage Products
          </Link>,
        )
      } else if (userRole === "CREATOR") {
        items.push(
          <Link key="profile" to="/profile" className="hover:text-yellow-400 transition-colors">
            Profile
          </Link>,
        )
      }
      items.push(
        <Link key="store" to="/store" className="hover:text-yellow-400 transition-colors">
          Store
        </Link>,
      )
      items.push(
        <Link key="logo" to="/" className="hover:text-yellow-400 transition-transform hover:scale-105 flex items-center">
          <Logo />
        </Link>,
      )
      items.push(
        <Link key="about" to="/about" className="hover:text-yellow-400 transition-colors">
          About
        </Link>,
      )
      items.push(
        <button key="logout" onClick={handleLogout} className="hover:text-yellow-400 transition-colors cursor-pointer">
          Logout
        </button>,
      )
    }

    return items
  }

  const navItems = getNavItems()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-black text-white w-full max-w-[1000px] mt-4 sm:mt-8 mb-[-2px] px-4 sm:px-10 rounded-3xl mx-auto shadow-lg"
    >
      {/* Desktop view - evenly distributed items */}
      <div className="hidden md:flex justify-evenly items-center h-[70px] text-base lg:text-xl font-poppins gap-4 lg:gap-10 relative -top-1">
        {navItems}
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex justify-between items-center h-[70px]">
        <Link to="/" className="hover:text-yellow-400 text-2xl">
          <Logo />
        </Link>
        <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none cursor-pointer">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown with AnimatePresence */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4 py-4 md:hidden text-lg overflow-hidden border-t border-gray-800"
          >
            {isAuthenticated && userRole === "CREATOR" && (
              <Link to="/profile" className="hover:text-yellow-400 transition-colors" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
            )}
            {isAuthenticated && userRole === "BRAND" && (
              <>
                <Link to="/dashboard/brand" className="hover:text-yellow-400 transition-colors" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/manage-products" className="hover:text-yellow-400 transition-colors" onClick={() => setMenuOpen(false)}>
                  Manage Products
                </Link>
                <Link to="/brand/interests" className="hover:text-yellow-400 transition-colors" onClick={() => setMenuOpen(false)}>
                  Creator Interests
                </Link>
              </>
            )}
            <Link to="/store" className="hover:text-yellow-400 transition-colors" onClick={() => setMenuOpen(false)}>
              Store
            </Link>
            <Link to="/about" className="hover:text-yellow-400 transition-colors" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            {!isAuthenticated ? (
              <>
                <Link to="/signin" className="hover:text-yellow-400 transition-colors" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-300 font-semibold text-center transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLogout()
                  setMenuOpen(false)
                }}
                className="hover:text-yellow-400 text-left cursor-pointer transition-colors"
              >
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
