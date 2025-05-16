"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import axios from "axios"

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()
  const { session } = useClerk()
  const router = useRouter()

const handleRoleSelect = async (role) => {
  if (!user) return

  setIsLoading(true)
  setSelectedRole(role)

  try {
    // Send role to secure API route
    await axios.post("/api/set-role", { role })

    // Optional: update your own DB too
    await axios.post("/api/user", {
      userId: user.id,
      role,
    })

    router.push("/dashboard")
  } catch (error) {
    console.error("Error setting user role:", error)
  } finally {
    setIsLoading(false)
  }
}


  return (
    <div className="bg-[#111] rounded-3xl mt-6 overflow-hidden p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Choose Your Role</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className={`bg-[#222] rounded-xl p-6 cursor-pointer transition-all hover:bg-[#333] ${selectedRole === "creator" ? "border-2 border-yellow-400" : ""}`}
          onClick={() => handleRoleSelect("creator")}
        >
          <div className="flex justify-center mb-4">
            <div className="bg-[#333] p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
          </div>
          <h3 className="text-white font-bold text-center mb-4">Creator</h3>
          <p className="text-gray-400 text-sm text-center">
            Join as a creator to discover and collaborate with brands. Browse products, create content, and grow your
            audience.
          </p>
        </div>

        <div
          className={`bg-[#222] rounded-xl p-6 cursor-pointer transition-all hover:bg-[#333] ${selectedRole === "brand" ? "border-2 border-yellow-400" : ""}`}
          onClick={() => handleRoleSelect("brand")}
        >
          <div className="flex justify-center mb-4">
            <div className="bg-[#333] p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814l-4.419-3.35-4.419 3.35A1 1 0 014 16V4zm2-1h8a1 1 0 011 1v10.586l-3.419-2.59a1 1 0 00-1.162 0L7 14.586V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-white font-bold text-center mb-4">Brand</h3>
          <p className="text-gray-400 text-sm text-center">
            Join as a brand to connect with creators. Upload products, manage collaborations, and increase your brand's
            reach.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
          <p className="text-white mt-2">Setting up your account...</p>
        </div>
      )}
    </div>
  )
}
