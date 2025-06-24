"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, userRole, loading } = useAuth()

  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  if (role && userRole !== role) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "CREATOR") {
      return <Navigate to="/dashboard/creator" replace />
    } else if (userRole === "BRAND") {
      return <Navigate to="/dashboard/brand" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
