"use client"

import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Button from "../components/ui/Button"
import { useAuth } from "../context/AuthContext"
import API from "../api"

const SetRole = () => {
  const [searchParams] = useSearchParams()
  const githubId = searchParams.get("github_id")
  const navigate = useNavigate()
  const { completeOAuthSignIn } = useAuth()

  const [selectedRole, setSelectedRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRole) {
      setError("Please choose a role to continue.")
      return
    }
    if (!githubId) {
      setError("Missing GitHub sign-in data. Please try signing in again.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const res = await API.post("/auth/set_role", {
        github_id: githubId,
        user_role: selectedRole,
      })

      const { token, user } = res.data
      completeOAuthSignIn(token, user)

      navigate(selectedRole === "CREATOR" ? "/profile" : "/dashboard/brand")
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!githubId) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-[#1C1C1C] rounded-2xl p-8 shadow-lg border border-[#2B2B2B] text-center">
            <h1 className="text-2xl font-bold text-white mb-3">Something's missing</h1>
            <p className="text-gray-400 mb-6">
              We couldn't find your GitHub sign-in details. Please try signing in again.
            </p>
            <Link to="/signin">
              <Button fullWidth className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#1C1C1C] rounded-2xl p-8 shadow-lg border border-[#2B2B2B]">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">One last step</h1>
          <p className="text-gray-400 mb-6 text-center">
            Tell us how you'll be using Collab Junction.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setSelectedRole("CREATOR")}
              className={`text-left p-4 rounded-xl border-2 transition ${
                selectedRole === "CREATOR"
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-[#2B2B2B] bg-[#242424] hover:border-gray-500"
              }`}
            >
              <span className="block text-white font-semibold">I'm a Creator</span>
              <span className="block text-gray-400 text-sm mt-1">
                Discover products and collaborate with brands.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("BRAND")}
              className={`text-left p-4 rounded-xl border-2 transition ${
                selectedRole === "BRAND"
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-[#2B2B2B] bg-[#242424] hover:border-gray-500"
              }`}
            >
              <span className="block text-white font-semibold">I'm a Brand</span>
              <span className="block text-gray-400 text-sm mt-1">
                List products and find creators to collaborate with.
              </span>
            </button>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl mt-2 disabled:opacity-60"
            >
              {isLoading ? "Setting up your account..." : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}

export default SetRole
