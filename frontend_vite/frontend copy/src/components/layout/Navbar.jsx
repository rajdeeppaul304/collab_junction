"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useState } from "react"
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

    // Add dashboard link if authenticated
    if (isAuthenticated && userRole === "CREATOR") {
      items.push(
        <Link key="dashboard" to="/dashboard/creator" className="hover:text-yellow-400">
          Dashboard
        </Link>,
      )
    }
    if (isAuthenticated && userRole === "BRAND") {
      items.push(
        <Link key="dashboard" to="/dashboard/brand" className="hover:text-yellow-400">
          Dashboard
        </Link>,
      )
    }

    // Add store link
    items.push(
      <Link key="store" to="/store" className="hover:text-yellow-400">
        Store
      </Link>,
    )

    // Add logo
    items.push(
      <Link key="logo" to="/" className="hover:text-yellow-400">
        <Logo />
      </Link>,
    )

    // Add profile link if creator
    if (isAuthenticated && userRole === "CREATOR") {
      items.push(
        <Link key="profile" to="/profile" className="hover:text-yellow-400">
          Profile
        </Link>,
      )
    }

    // Add about link
    items.push(
      <Link key="about" to="/about" className="hover:text-yellow-400">
        About
      </Link>,
    )

    // Add auth links
    if (!isAuthenticated) {
      items.push(
        <Link key="signin" to="/signin" className="hover:text-yellow-400">
          Sign In
        </Link>,
      )
      items.push(
        <Link key="signup" to="/signup" className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500">
          Sign Up
        </Link>,
      )
    } else {
      items.push(
        <button key="logout" onClick={handleLogout} className="hover:text-yellow-400">
          Logout
        </button>,
      )
    }

    return items
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-black text-white w-full max-w-[1117px]  h-[74px] mt-8 mb-[-5px] px-6 rounded-3xl mx-auto">
      {/* Desktop view - evenly distributed items */}
      <div className="hidden md:flex justify-evenly items-center h-[70px] text-2xl font-poppins   ">{navItems}</div>

      {/* Mobile view */}
      <div className="md:hidden flex justify-between items-center h-[70px]">
        <Link to="/" className="hover:text-yellow-400 text-2xl">
          <Logo />
        </Link>
        <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="flex flex-col gap-4 py-4 md:hidden text-lg animate-slideDown">
          {isAuthenticated && userRole === "CREATOR" && (
            <Link to="/dashboard/creator" className="hover:text-yellow-400" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          {isAuthenticated && userRole === "BRAND" && (
            <Link to="/dashboard/brand" className="hover:text-yellow-400" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          <Link to="/store" className="hover:text-yellow-400" onClick={() => setMenuOpen(false)}>
            Store
          </Link>
          {isAuthenticated && userRole === "CREATOR" && (
            <Link to="/profile" className="hover:text-yellow-400" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
          )}
          <Link to="/about" className="hover:text-yellow-400" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to="/signin" className="hover:text-yellow-400" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500"
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
              className="hover:text-yellow-400 text-left"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
