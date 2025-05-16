"use client"

import Header from "@/components/header"
import axios from "axios"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

function Provider({ children }) {
  const { user, isLoaded } = useUser()
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        checkUserInDatabase()
      } else {
        setIsInitialized(true)
      }
    }
  }, [user, isLoaded])

  const checkUserInDatabase = async () => {
    try {
      // Check if user exists in our database
      const result = await axios.post("/api/user", {
        user,
      })

      // If user doesn't have a role yet, redirect to role selection
      if (user && !user.publicMetadata?.role) {
        router.push("/role-selection")
      }

      setIsInitialized(true)
    } catch (error) {
      console.error("Error checking user:", error)
      setIsInitialized(true)
    }
  }

  // Show loading state while checking user
  if (!isInitialized && isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
        <p className="text-white ml-2">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div>{children}</div>
    </div>
  )
}

export default Provider
