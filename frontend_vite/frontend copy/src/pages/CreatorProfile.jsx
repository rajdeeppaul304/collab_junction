// src/pages/brand/CreatorProfile.jsx
"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
// import BrandAPI from "../../brandApi"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import BrandAPI from "../brandApi"

const CreatorProfile = () => {
  const { creatorId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await BrandAPI.get(`/creators/${creatorId}/profile`)
        setProfile(res.data)
      } catch (err) {
        console.error("Error fetching creator profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [creatorId])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </MainLayout>
    )
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-gray-400">Profile not found</div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
          <p className="text-gray-400 mb-4">{profile.bio || "No bio available."}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1 text-yellow-400">Social Links</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                {Object.entries(profile.social).map(([key, value]) =>
                  value ? (
                    <li key={key}>
                      <span className="capitalize">{key}:</span>{" "}
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        {value}
                      </a>
                    </li>
                  ) : null
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-yellow-400">Contact</h3>
              <p className="text-sm text-gray-300">{profile.phone || "Phone not available"}</p>
            </div>
          </div>

        </Card>
      </div>
    </MainLayout>
  )
}

export default CreatorProfile
