"use client"

import { createContext, useState, useEffect, useContext } from "react"
import API from "../api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Set token to API headers
  const setAuthToken = (token) => {
    if (token) {
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete API.defaults.headers.common["Authorization"]
    }
  }

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        setAuthToken(token)
        try {
          const response = await API.get("/auth/me")
          setUser(response.data)
        } catch (err) {
          console.error("Authentication error:", err)
          localStorage.removeItem("token")
          setAuthToken(null)
        }
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const signin = async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const response = await API.post("/auth/signin", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      setAuthToken(token)
      setUser(user)
      return user.role
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during sign in")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await API.post("/auth/signup", userData)

      // Updated to just return message
      return response.data.msg
    } catch (err) {
      setError(err.response?.data?.msg || "An error occurred during sign up")
      throw err
    } finally {
      setLoading(false)
    }
  }


  const signout = () => {
    localStorage.removeItem("token")
    setAuthToken(null)
    setUser(null)
  }

  const isAuthenticated = !!user
  const userRole = user?.role

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signin,
        signup,
        signout,
        isAuthenticated,
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
