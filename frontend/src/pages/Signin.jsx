"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Logo from "../components/ui/Logo"

const Signin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const { signin } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const userRole = await signin(formData.email, formData.password)

      if (userRole === "CREATOR") {
        navigate("/profile")
      } else if (userRole === "BRAND") {
        navigate("/dashboard/brand")
      } else {
        navigate("/")
      }
    } catch (error) {
      setErrors({
        general: error.response?.data?.msg || error.response?.data?.message || "Invalid email or password",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1C1C1C] rounded-2xl p-8 shadow-lg border border-[#2B2B2B]">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          <h1 className="text-3xl font-extrabold text-white text-center mb-6 tracking-wide">
            Welcome Back 👋
          </h1>

          {errors.general && (
            <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-2 rounded-md mb-4 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              className="bg-[#2A2A2A] text-white"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              className="bg-[#2A2A2A] text-white"
            />

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              className="mt-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl transition-all duration-200"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#2B2B2B]" />
            <span className="text-gray-500 text-xs uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-[#2B2B2B]" />
          </div>

          <a
            href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/auth/login/github`}
            className="flex items-center justify-center gap-2 w-full border border-[#2B2B2B] bg-[#242424] hover:bg-[#2E2E2E] text-white font-semibold py-3 rounded-xl transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.69.42.36.78 1.08.78 2.18 0 1.57-.02 2.84-.02 3.23 0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
            </svg>
            Continue with GitHub
          </a>

          <div className="mt-6 text-center text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-yellow-400 hover:underline font-semibold">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signin
