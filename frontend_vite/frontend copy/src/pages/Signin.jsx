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
        navigate("/profile/")
      } else if (userRole === "BRAND") {
        navigate("/dashboard/brand")
      } else {
        navigate("/")
      }
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || "Invalid email or password",
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

          <div className="mt-6 text-center text-gray-400 text-sm">
            Don’t have an account?{" "}
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
