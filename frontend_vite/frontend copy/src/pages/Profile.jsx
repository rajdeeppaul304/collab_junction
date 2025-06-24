"use client"

import { useState, useEffect } from "react"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import CreatorAPI from "../creatorApi" 
import { useAuth } from "../context/AuthContext"

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [collaborations, setCollaborations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    languages: [],
    instagram: "",
    website: "",
    phone: "",
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, collabRes] = await Promise.all([
          CreatorAPI.get("/profile"),
          CreatorAPI.get("/collaborations"),
        ])

        setProfile(profileRes.data)
        setCollaborations(collabRes.data)

        // Initialize form data with profile data
        setFormData({
          name: profileRes.data.name,
          bio: profileRes.data.bio,
          languages: profileRes.data.languages,
          instagram: profileRes.data.social?.instagram,
          website: profileRes.data.social?.website,
          phone: profileRes.data.phone,
        })
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      await CreatorAPI.put("/profile", {
        ...formData,
        social: {
          instagram: formData.instagram,
          website: formData.website,
        },
      })

      // Update profile state with new data
      setProfile((prev) => ({
        ...prev,
        name: formData.name,
        bio: formData.bio,
        languages: formData.languages,
        social: {
          instagram: formData.instagram,
          website: formData.website,
        },
        phone: formData.phone,
      }))

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Image */}
              <div className="md:col-span-1">
                <div className="relative">
                  <img
                    src={profile.avatar || "/placeholder.svg"}
                    alt={profile.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />

                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button className="bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </button>
                    <button className="bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="md:col-span-2">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-3xl font-bold">{profile.name}</h2>
                        <p className="text-gray-400">{profile.title}</p>
                      </div>
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 text-gray-400"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Speaks: {profile.languages?.join(" | ") || "Not specified"}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-2xl font-bold text-yellow-400">{profile.followers} Followers</h3>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {profile.social?.instagram && (
                        <a
                          href={`https://instagram.com/${profile.social.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-800 rounded-full px-4 py-2 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                          </svg>
                          @{profile.social.instagram}
                        </a>
                      )}

                      {profile.social?.website && (
                        <a
                          href={profile.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-800 rounded-full px-4 py-2 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" x2="22" y1="12" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                          {profile.social.website}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Account Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">About me</h2>
              <p className="text-gray-300">{profile.bio}</p>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Account Information</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">User ID (UID)</p>
                  <p>{profile.uid}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p>{profile.email}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p>{profile.name}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Phone Number</p>
                  <p>{profile.phone || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Instagram Handle</p>
                  <p>{profile.social?.instagram || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Role</p>
                  <p className="text-green-500 font-bold">CREATOR</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Account Status</p>
                  <p className="text-green-500 font-bold">ACTIVE</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Joined</p>
                  <p>{profile.joinedDate || "5/9/2025"}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Collaborations */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Product Collaborations</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collaborations.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-8">
                No product collaborations yet. Browse the store to find products to collaborate with.
              </p>
            ) : (
              collaborations.map((collab) => (
                <div key={collab.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-700">
                    <img
                      src={collab.image || "/placeholder.svg"}
                      alt={collab.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{collab.name}</h3>
                    <p className="text-sm text-gray-400">By {collab.company}</p>
                    <p className="text-yellow-400 my-1">Rs. {collab.price}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}

export default Profile
