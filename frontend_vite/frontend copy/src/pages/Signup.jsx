"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Logo from "../components/ui/Logo"

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const { signup } = useAuth()

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

    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"

    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    if (!formData.role) newErrors.role = "Please select a role"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setSuccessMsg("")

    try {
      const msg = await signup(formData)
      setSuccessMsg(msg || "Account created. Please verify your email before signing in.")

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      })
    } catch (error) {
      setErrors({
        general: error.response?.data?.msg || "Error creating account",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>

          {successMsg && (
            <div className="bg-green-900/30 border border-green-500 text-green-400 px-4 py-2 rounded-md mb-4">
              {successMsg}
            </div>
          )}

          {errors.general && (
            <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-2 rounded-md mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-300">I am a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-3 rounded-md border text-center ${
                    formData.role === "CREATOR"
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "bg-transparent border-gray-700 text-white"
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, role: "CREATOR" }))}
                >
                  Creator
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-md border text-center ${
                    formData.role === "BRAND"
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "bg-transparent border-gray-700 text-white"
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, role: "BRAND" }))}
                >
                  Brand
                </button>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
            </div>

            <Button type="submit" fullWidth disabled={isLoading} className="mt-4">
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center text-gray-400">
            Already have an account?{" "}
            <Link to="/signin" className="text-yellow-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
