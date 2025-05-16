"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        checkUserRole()
      } else {
        setIsLoading(false)
      }
    }
  }, [user, isLoaded])

  const checkUserRole = async () => {
    try {
      // Check if user has a role
      const role = user.publicMetadata?.role

      if (role === "creator") {
        router.push("/dashboard/creator")
      } else if (role === "brand") {
        router.push("/dashboard/brand")
      } else {
        // If no role, redirect to role selection
        router.push("/role-selection")
      }
    } catch (error) {
      console.error("Error checking user role:", error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        <div className="bg-[#111] rounded-3xl p-8 flex justify-center items-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
          <p className="text-white ml-2">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      <div className="bg-[#111] rounded-3xl p-8">
        <p className="text-white text-xl mb-6">Welcome to your Collab Junction dashboard!</p>
        <div className="flex gap-4">
          <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
            <Link href="/profile">Go to Profile</Link>
          </Button>
          <Button asChild variant="outline" className="bg-white text-black hover:bg-gray-200">
            <Link href="/store">Browse Store</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
