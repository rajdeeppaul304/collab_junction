"use client"

import { useState, useEffect, useRef } from "react"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import CreatorAPI from "../creatorApi"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import getImageUrl from "../utils/getImageUrl"
import { Dialog } from "@headlessui/react"
import { useForm, useFieldArray } from "react-hook-form"

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [collaborations, setCollaborations] = useState([])
  const [interests, setInterests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const [existingImageUrl, setExistingImageUrl] = useState("")

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      short_bio: "",
      bio: "",
      languages: [{ value: "" }],
      instagram: "",
      website: "",
      phone: ""
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages"
  })

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
        setExistingImageUrl(profileRes.data.avatar || "")
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        short_bio: profile.short_bio || "",
        bio: profile.bio || "",
        languages: profile.languages?.map(lang => ({ value: lang })) || [{ value: "" }],
        instagram: profile.social?.instagram || "",
        website: profile.social?.website || "",
        phone: profile.phone || ""
      })
      setExistingImageUrl(profile.avatar || "")
    }
  }, [profile, reset])

  const handleSave = async (data) => {
    const formData = new FormData()

    // Append basic profile fields
    formData.append("name", data.name)
    formData.append("short_bio", data.short_bio)
    formData.append("bio", data.bio)
    formData.append("phone", data.phone)

    // Append languages array
    data.languages.forEach((lang) => formData.append("languages[]", lang.value))

    // Append social data
    formData.append("social", JSON.stringify({
      instagram: data.instagram,
      website: data.website,
    }))

    // Append image file if uploaded
    if (profileImageFile) {
      formData.append("image", profileImageFile)
    }

    // If user removed image and there's no existing one left
    if (!previewImage && !profileImageFile && existingImageUrl === "") {
      formData.append("image_deleted", "true")
    }

    try {
      await CreatorAPI.put("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Refetch updated profile info
      const res = await CreatorAPI.get("/profile")
      setProfile(res.data)

      alert("Profile updated!")
      setIsEditOpen(false)
    } catch (err) {
      console.error("Update failed:", err)
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
      <div className="max-w-7xl mx-auto px-6 py-8 bg-[#242424] text-white rounded-xl shadow-lg mt-8 mb-8">
        <h2 className="text-3xl font-semibold mb-6 ml-14">Profile</h2>

        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 h-[350px]">
          <div className="flex gap-5 items-start w-[550px] h-[350px] ml-28">
            <img
              src={getImageUrl(profile?.avatar)}
              alt={profile?.name}
              className="w-full h-full object-cover rounded-xl "
            />
            <div className="ml-8 mt-12">
              <h1 className="text-4xl font-semibold mb-4">{profile?.name}</h1>
              <p className="text-gray-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {profile?.short_bio}
              </p>


              <p className="text-sm text-white mb-2 flex items-center text-center">
                <img src="/Group.png" alt="Logo" className="w-6 h-6 mr-2 mb-10 mt-3" />
                <span className="font-semibold mb-10 mt-3">Speaks:</span>&nbsp;
                {profile?.speaks?.join(", ")}
              </p>

              <p className="text-2xl font-semibold text-yellow-300">
                {profile?.followers || "93k"} Followers
              </p>

              <div className="flex gap-4 mt-4">
                
                  <a href={`https://instagram.com/${profile.social.instagram}`} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-white text-black font-semibold rounded-[20px] h-[50px] w-[170px] hover:bg-gray-200 flex items-center">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-2">
                        <img src="/Group.png" alt="Logo" className="w-4 h-4" />
                      </div>
                      @{profile.social.instagram}
                    </Button>
                  </a>
              
                  <a href={profile.social.website} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-white text-black font-semibold rounded-[20px] h-[50px] w-[227px] hover:bg-gray-200 flex items-center">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-2">
                        <img src="/Group.png" alt="Logo" className="w-4 h-4" />
                      </div>
                      Website
                    </Button>
                  </a>
              
              </div>
            </div>
          </div>

          <div>
            <img
              src="/Group 74.png"
              alt="Edit"
              onClick={() => setIsEditOpen(true)}
              className="w-[50px] h-[50px] mr-6 cursor-pointer rounded-full transition duration-200 hover:opacity-60"
            />
          </div>
        </div>

        <hr className="w-[1278px] bg-gray-700 my-8 ml-[-23px]" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-3 ml-28">
            {/* About Me */}
            <h2 className="text-3xl font-bold">About me</h2>
            <p className="text-white text-[12px] font-bold leading-relaxed">
              {profile?.bio}
            </p>

            <div className="flex justify-between items-center mb-2 mt-6">
              <h2 className="text-3xl font-bold">Your Shown Interests</h2>
            </div>

            {/* Interests Table */}
            <Card className="p-6 bg-[#2B2B2B] rounded-xl shadow-md border border-white mt-3">
              {interests.length === 0 ? (
                <p className="text-gray-400">You haven't shown interest in any products yet.</p>
              ) : (
                <div className="overflow-x-auto -m-6 mb-0">
                  <table className="w-full text-left text-sm table-fixed">
                    <thead>
                      <tr className="bg-[#171717] text-white">
                        <th className="py-4 px-6 min-h-[50px] w-1/5 rounded-tl-xl">Product</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5">Category</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5">Price</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5">Status</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5 rounded-tr-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="px-6">
                      {interests.map((item, index) => (
                        <tr key={index} className="font-bold text-white">
                          <td className="py-3 px-6">{item.name}</td>
                          <td className="py-3 px-6">{item.category}</td>
                          <td className="py-3 px-6">₹{item.price}</td>
                          <td className="py-3 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-xs  font-medium ${item.status === "active"
                                  ? "bg-green-400/20 text-green-400"
                                  : "bg-gray-400/20 text-gray-400"
                                }`}
                            >
                              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Unknown"}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <Link to={`/product/${item.id}`}>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-400/20 text-blue-400">
                                View
                              </span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <div className="flex justify-between items-center mb-2 mt-6">
              <h2 className="text-3xl font-bold">Product Collaborations</h2>
            </div>

            {/* Collaborations Table */}
            <Card className="p-6 bg-[#2B2B2B] rounded-xl shadow-md border border-white mt-3">
              {collaborations.length === 0 ? (
                <p className="text-gray-400">No product collaborations yet.</p>
              ) : (
                <div className="overflow-x-auto -m-6 mb-0">
                  <table className="w-full text-left text-sm table-fixed">
                    <thead>
                      <tr className="bg-[#171717] text-white">
                        <th className="py-4 px-6 min-h-[50px] w-1/5 rounded-tl-xl">Product</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5">Company</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5">Price</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5">Status</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5 rounded-tr-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="px-6">
                      {collaborations.map((collab, index) => (
                        <tr key={index} className="font-bold text-white">
                          <td className="py-3 px-6">{collab.name}</td>
                          <td className="py-3 px-6">{collab.company}</td>
                          <td className="py-3 px-6">₹{collab.price}</td>
                          <td className="py-3 px-6">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-400/20 text-green-400">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === "active"
                                ? "bg-green-400/20 text-green-400"
                                : "bg-gray-400/20 text-gray-400"
                                }`}
                            >
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-400/20 text-blue-400">
                              View
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Account Information Sidebar */}
          <Card className="p-6 bg-[#2B2B2B] rounded-xl ml-[50px] shadow-md w-[300px] h-[420px]">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
              <p>User ID (UID): <span className="text-white">{profile?.uid}</span></p>
              <p>Name: <span className="text-white">{profile?.name}</span></p>
              <p>Email: <span className="text-white">{profile?.email}</span></p>
              <p>Phone Number: <span className="text-white">{profile?.phone || "Not provided"}</span></p>
              <p>Instagram Handle: <span className="text-white">@{profile?.social?.instagram || "Not provided"}</span></p>
              <p>Role: <span className="text-green-400">CREATOR</span></p>
              <p>Followers: <span className="text-white">{profile?.followers || 0}</span></p>
              <p>Interests: <span className="text-white">{interests?.length || 0}</span></p>
              <p>Account Status: <span className="text-green-400">ACTIVE</span></p>
              <p>Joined: <span className="text-white">{profile?.joinedDate || "5/9/2025"}</span></p>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} className="relative z-50">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel className="w-full max-w-2xl bg-[#1e1e1e] text-white rounded-xl shadow-xl p-6 flex flex-col max-h-[90vh]">
            {/* Title */}
            <Dialog.Title className="text-xl font-bold mb-6">Edit Profile</Dialog.Title>

            {/* Form Content */}
            <form onSubmit={handleSubmit(handleSave)} className="flex flex-col flex-grow space-y-6 overflow-y-auto pr-4 pl-4">

              {/* Section: Personal Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200">Personal Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm">Full Name</label>
                    <input {...register("name")} className="w-full p-2 rounded bg-[#121212] border border-gray-700" />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm">Short Bio</label>
                    <input {...register("short_bio")} className="w-full p-2 rounded bg-[#121212] border border-gray-700" />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm">Phone Number</label>
                    <input {...register("phone")} className="w-full p-2 rounded bg-[#121212] border border-gray-700" />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm">Profile Image</label>

                    {previewImage || existingImageUrl ? (
                      <div className="relative w-32 h-32 mb-2">
                        <img
                          src={previewImage || existingImageUrl}
                          alt="Profile preview"
                          className="object-cover w-full h-full rounded border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (previewImage) {
                              URL.revokeObjectURL(previewImage)
                            }
                            setPreviewImage("")
                            setProfileImageFile(null)
                            setExistingImageUrl("")
                          }}
                          className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full px-2"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="profile-image"
                        className="block w-full p-4 text-center border border-dashed border-gray-600 rounded cursor-pointer bg-[#121212] text-gray-400"
                      >
                        Click to upload image
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                              const previewUrl = URL.createObjectURL(file)
                              setPreviewImage(previewUrl)
                              setProfileImageFile(file)
                              setExistingImageUrl("")
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: About */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200">About</h3>
                <textarea
                  {...register("bio")}
                  rows={4}
                  className="w-full p-2 rounded bg-[#121212] border border-gray-700"
                />
              </div>

              {/* Section: Languages */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200">Languages (up to 10)</h3>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`languages.${index}.value`)}
                        className="flex-1 p-2 rounded bg-[#121212] border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-400 text-4xl"
                        disabled={fields.length === 1}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {fields.length < 10 && (
                    <button
                      type="button"
                      onClick={() => append({ value: "" })}
                      className="text-green-400 text-sm mt-2"
                    >
                      + Add another language
                    </button>
                  )}
                </div>
              </div>

              {/* Section: Social Links */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200">Social Links</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm">Instagram Handle</label>
                    <input {...register("instagram")} className="w-full p-2 rounded bg-[#121212] border border-gray-700" />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm">Website</label>
                    <input {...register("website")} className="w-full p-2 rounded bg-[#121212] border border-gray-700" />
                  </div>
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4 sticky bottom-0 bg-[#1e1e1e]">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmit(handleSave)}>
                Save
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </MainLayout>
  )
}

export default Profile