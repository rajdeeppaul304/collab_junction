"use client"

import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Share2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const email = decodeURIComponent(params.email)

  if (status === "loading") {
    return <p className="text-white p-8">Loading...</p>
  }

  if (!session) {
    return <p className="text-white p-8">Please login to view this page.</p>
  }

  if (session.user?.email !== email) {
    return <p className="text-white p-8">Unauthorized: You can only view your own profile.</p>
  }

  const user = {
    name: session.user?.name || "Unnamed",
    email,
    image: session.user?.image || "/placeholder.svg?height=400&width=400",
    title: "Creative UI/UX Designer Crafting Engaging Experience",
    languages: ["English", "Hindi", "Punjabi", "Russian"],
    followers: "97.3k",
    social: {
      instagram: "@DownDating",
      website: "downdating.com",
      instagramShow: "@downdating.show",
    },
    bio: "Pizza ipsum dolor meat lovers buffalo...",
    accountInfo: {
      id: "5459e438-5061",
      email,
      name: session.user?.name || "",
      phone: "+919213956392",
      instagram: "@downdating.show",
      role: "CREATOR",
      status: "ACTIVE",
      joined: "5/9/2025",
    },
  }

  return (
    <div className="text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
      <Image src={user.image} alt={user.name} width={150} height={150} className="rounded-full" />
      <p className="mt-2">{user.title}</p>
      <p className="mt-2">{user.bio}</p>
      <p className="mt-2">Languages: {user.languages.join(", ")}</p>
      <p className="mt-2">Followers: {user.followers}</p>
      {/* Add more profile sections as needed */}
    </div>
  )
}
