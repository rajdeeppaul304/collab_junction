"use client"

import { useState, useEffect, useRef } from "react"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import CreatorAPI from "../creatorApi" 
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import getImageUrl from "../utils/getImageUrl"

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [collaborations, setCollaborations] = useState([])
  const [interests, setInterests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    short_bio: "",
    bio: "",
    languages: [],
    instagram: "",
    website: "",
    phone: "",
    avatar: "",
  })
  const [languageInput, setLanguageInput] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [imageDeleted, setImageDeleted] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, collabRes, interestsRes] = await Promise.all([
          CreatorAPI.get("/profile"),
          CreatorAPI.get("/collaborations"),
          CreatorAPI.get("/interests"),
        ])

        setProfile(profileRes.data)
        setCollaborations(collabRes.data)
        setInterests(interestsRes.data)

        // Initialize form data with profile data
        setFormData({
          name: profileRes.data.name || "",
          short_bio: profileRes.data.short_bio || "",
          bio: profileRes.data.bio || "",
          languages: profileRes.data.languages || [],
          instagram: profileRes.data.social?.instagram || "",
          website: profileRes.data.social?.website || "",
          phone: profileRes.data.phone || "",
          avatar: profileRes.data.avatar || "",
        })
        setImagePreview(profileRes.data.avatar || "")
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setImageDeleted(false)
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteProfileImage = () => {
    setSelectedImage(null)
    setImagePreview("")
    setImageDeleted(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAddLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()],
      }))
      setLanguageInput("")
    }
  }

  const handleRemoveLanguage = (languageToRemove) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove),
    }))
  }

  const handleSaveProfile = async () => {
    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData()
      
      // Add text fields
      formDataToSend.append('name', formData.name)
      formDataToSend.append('short_bio', formData.short_bio)
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('languages', JSON.stringify(formData.languages))
      formDataToSend.append('phone', formData.phone)
      
      // Add social data as JSON string
      formDataToSend.append('social', JSON.stringify({
        instagram: formData.instagram,
        website: formData.website,
      }))
      
      // Handle image upload
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }
      
      // Handle image deletion
      if (imageDeleted) {
        formDataToSend.append('image_deleted', 'true')
      }

      const response = await CreatorAPI.put("/profile", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update profile state with new data
      setProfile((prev) => ({
        ...prev,
        name: formData.name,
        short_bio: formData.short_bio,
        bio: formData.bio,
        languages: formData.languages,
        social: {
          instagram: formData.instagram,
          website: formData.website,
        },
        phone: formData.phone,
        avatar: response.data.avatar_url || (imageDeleted ? "" : prev.avatar),
      }))

      // Reset image-related states
      setSelectedImage(null)
      setImageDeleted(false)
      setIsModalOpen(false)
      
      // Show success message
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    }
  }

  const handleCloseModal = () => {
    // Reset form data to original profile data
    setFormData({
      name: profile.name || "",
      short_bio: profile.short_bio || "",
      bio: profile.bio || "",
      languages: profile.languages || [],
      instagram: profile.social?.instagram || "",
      website: profile.social?.website || "",
      phone: profile.phone || "",
      avatar: profile.avatar || "",
    })
    setLanguageInput("")
    setSelectedImage(null)
    setImagePreview(profile.avatar || "")
    setImageDeleted(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsModalOpen(false)
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Profile</h1>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Image */}
              <div className="md:col-span-1">
                <div className="relative">
                  <img
                    src={getImageUrl(profile.avatar) || "/placeholder.svg"}
                    alt={profile.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="md:col-span-2">
                <div>
                  <h2 className="text-3xl font-bold">{profile.name}</h2>
                  <p className="text-gray-400">{profile.title}</p>
                </div>

                {profile.short_bio && (
                  <div className="mt-4">
                    <p className="text-gray-300">{profile.short_bio}</p>
                  </div>
                )}

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

        {/* Your Shown Interests Section */}
        <Card className="mb-8 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Shown Interests</h2>
          </div>

          {interests.length === 0 ? (
            <p className="text-gray-400 text-center py-8">You haven't shown interest in any products yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {interests.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="h-40 w-full rounded-md overflow-hidden bg-gray-700 mb-3">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-lg mb-1">{item.productName}</h3>
                  <p className="text-sm text-gray-400 mb-1">By {item.brandName}</p>
                  <p className="text-yellow-400">Rs. {item.price}</p>
                  <Link to={`/product/${item.id}`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      View Product
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </Card>

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

        {/* Edit Profile Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Edit Profile</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Profile Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Profile Image</label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={getImageUrl(imagePreview) || "/placeholder.svg"}
                          alt="Profile Preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                        />
                        {(imagePreview || profile.avatar) && (
                          <button
                            onClick={handleDeleteProfileImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleImageUpload}
                          className="flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Upload New Image
                        </Button>
                        <p className="text-xs text-gray-400">
                          JPG, PNG or GIF (max 5MB)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    />
                  </div>

                  {/* Short Bio */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Short Bio</label>
                    <input
                      type="text"
                      name="short_bio"
                      value={formData.short_bio}
                      onChange={handleInputChange}
                      placeholder="A brief description about yourself"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    />
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Languages Spoken</label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        placeholder="Enter a language"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                      />
                      <Button variant="outline" size="sm" onClick={handleAddLanguage}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((language, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {language}
                          <button
                            onClick={() => handleRemoveLanguage(language)}
                            className="ml-2 text-gray-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">About Me (Bio)</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    />
                  </div>

                  {/* Instagram Handle */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Instagram Handle</label>
                    <div className="flex items-center">
                      <span className="bg-gray-800 border border-gray-700 border-r-0 px-3 py-2 text-gray-400 rounded-l-md">@</span>
                      <input
                        type="text"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-r-md text-white"
                      />
                    </div>
                  </div>

                  {/* Website URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Website URL</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://your-website.com"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Profile