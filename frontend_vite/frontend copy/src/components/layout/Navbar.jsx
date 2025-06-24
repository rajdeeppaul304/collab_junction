"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Logo from "../ui/Logo"

const Navbar = () => {
  const { isAuthenticated, userRole, signout } = useAuth()
  const navigate = useNavigate()

  const handleSignout = () => {
    signout()
    navigate("/")
  }

  return (
    <nav className="bg-black text-white py-3 px-4 rounded-full mx-auto my-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {isAuthenticated && userRole === "CREATOR" && (
            <Link to="/dashboard/creator" className="hover:text-yellow-400">
              Dashboard
            </Link>
          )}
          {isAuthenticated && userRole === "BRAND" && (
            <Link to="/dashboard/brand" className="hover:text-yellow-400">
              Dashboard
            </Link>
          )}
          <Link to="/store" className="hover:text-yellow-400">
            Store
          </Link>
          <Link to="/" className="flex items-center justify-center">
            <Logo />
          </Link>
          {isAuthenticated && userRole === "CREATOR" && (
            <Link to="/profile" className="hover:text-yellow-400">
              Profile
            </Link>
          )}
          <Link to="/about" className="hover:text-yellow-400">
            About
          </Link>
        </div>

        {!isAuthenticated && (
          <div className="flex items-center space-x-4">
            <Link to="/signin" className="hover:text-yellow-400">
              Sign In
            </Link>
            <Link to="/signup" className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500">
              Sign Up
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <button onClick={handleSignout} className="hover:text-yellow-400">
            Sign Out
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
