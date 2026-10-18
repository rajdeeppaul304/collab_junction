"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#171717]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  if (role && userRole !== role) {
    // Redirect to the appropriate landing page based on role
    if (userRole === "CREATOR") {
      return <Navigate to="/profile" replace />
    } else if (userRole === "BRAND") {
      return <Navigate to="/dashboard/brand" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
