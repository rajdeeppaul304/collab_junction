"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import BrandAPI from "../brandApi"
import { Dialog } from "@headlessui/react"
import { useForm, useFieldArray } from "react-hook-form"
import getImageUrl from "../utils/getImageUrl"

import { useAuth } from "../context/AuthContext"

const BrandDashboard = () => {
  const { user } = useAuth()

  const [brandInfo, setBrandInfo] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [brandImageFile, setBrandImageFile] = useState(null)      // For new uploaded file
  const [previewImage, setPreviewImage] = useState("")            // For showing preview
  const [existingImageUrl, setExistingImageUrl] = useState("")    // Existing saved image

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const brandRes = await BrandAPI.get("/brand-info")
        const productsRes = await BrandAPI.get("/products?limit=4")

        setBrandInfo(brandRes.data)
        setProducts(productsRes.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])


  const [isEditOpen, setIsEditOpen] = useState(false)

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      instagram_handle: "",
      locations: [{ value: "" }],
      bio: "",
      image_url: ""
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "locations"
  })

  useEffect(() => {
    if (brandInfo) {
      reset({
        name: brandInfo.name,
        instagram_handle: brandInfo.instagram_handle,
        locations: brandInfo.locations?.map(loc => ({ value: loc })) || [{ value: "" }],
        bio: brandInfo.bio,
        image_url: brandInfo.image_url
      })
    }
  }, [brandInfo, reset])

  const handleSave = async (data) => {
    const formData = new FormData()

    // Append basic brand fields
    formData.append("name", data.name)
    formData.append("instagram_handle", data.instagram_handle)
    formData.append("bio", data.bio)

    // Append locations (array of { value: "City" })
    data.locations.forEach((loc) => formData.append("locations[]", loc.value))


    // Append image file if uploaded
    if (brandImageFile) {
      formData.append("image", brandImageFile)
    }

    // If user removed image and there's no existing one left
    if (!previewImage && !brandImageFile && existingImageUrl === "") {
      formData.append("image_deleted", "true")
    }

    try {
      await BrandAPI.put("/brand-info", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Refetch updated brand info
      const res = await BrandAPI.get("/brand-info")
      setBrandInfo(res.data)

      alert("Brand info updated!")
      setIsEditOpen(false)
    } catch (err) {
      console.error("Update failed:", err)
      alert("Failed to update brand info")
    }
  }


  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-8 bg-[#242424] text-white rounded-xl shadow-lg mt-8 mb-8 ">
        <h2 className="text-3xl font-semibold mb-6 ml-14">Brand Dashboard</h2>

        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 h-[350px]">
          <div className="flex gap-5 items-start w-[250px] h-[350px] ml-28" >
            <img
              // src={brandInfo?.image_url}
              src={getImageUrl(brandInfo?.image_url)}
              alt={brandInfo?.name}
              className="w-full h-full object-cover rounded-xl border-2 border-green-500"
            />
            <div className="ml-8" >
              <h1 className="text-4xl font-semibold mb-4 ">{brandInfo?.name}</h1>
              <p className="text-gray-400 mb-1">{brandInfo?.slogan}</p>

              <p className="text-sm text-white mb-2 flex items-center  text-center">
                <img src="/Group.png" alt="Logo" className="w-6 h-6 mr-2" />
                <span className="font-semibold">Available in:</span>&nbsp;
                {brandInfo?.locations?.join(", ")}
              </p>


              <p className="text-2xl font-semibold text-yellow-300 "> $
                {brandInfo?.sales_per_month} sales/month · {brandInfo?.product_count}+ Products
              </p>
              <div className="flex gap-4 mt-4 justify-\">
                <a href={brandInfo?.instagram} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-black font-semibold rounded-[20px] h-[50px] w-[170px] hover:bg-gray-200 flex items-center ">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-2">
                      <img src="/Group.png" alt="Logo" className="w-4 h-4" />
                    </div>
                    @{brandInfo?.instagram_handle}
                  </Button>
                </a>

                <a href={brandInfo?.website} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-black font-semibold rounded-[20px] h-[50px] w-[227px] hover:bg-gray-200 flex items-center ">
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
              className="w-[50px] h-[50px] mr-6 cursor-pointer rounded-full transition duration-200 hover:opacity-60 "
            />



          </div>

        </div>
        <hr className="w-[1278px]  bg-gray-700 my-8 ml-[-23px]" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-3 ml-28">

            {/* About Me */}
            <h2 className="text-3xl font-bold ">About me</h2>
            <p className="text-white text-[12px] font-bold leading-relaxed">
              {brandInfo?.bio}
            </p>
            <div className="flex justify-between items-center mb-2 mt-6">
              <h2 className="text-3xl font-bold">Uploaded Products</h2>
            </div>

            {/* Uploaded Products */}
            <Card className="p-6 bg-[#2B2B2B] rounded-xl shadow-md border border-white mt-3">
              {products.length === 0 ? (
                <p className="text-gray-400">You haven't added any products yet.</p>
              ) : (
                <div className="overflow-x-auto -m-6 mb-0">
                  <table className="w-full text-left text-sm table-fixed">
                    <thead>
                      <tr className="bg-[#171717] text-white">
                        <th className="py-4 px-6 min-h-[50px] w-1/5 rounded-tl-xl">Product</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5">Category</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5">Price</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5">Sales</th>
                        <th className="py-4 px-6 min-h-[50px] w-1/5 rounded-tr-xl">Status</th>
                      </tr>

                    </thead>
                    <tbody className="px-6">
                      {products.map((product, index) => (
                        <tr key={index} className="font-bold text-white">
                          <Link to={`/product/${product.id}`}>
                            <td className="py-3 px-6">{product.name}</td>
                          </Link>
                          <td className="py-3 px-6">{product.category || "N/A"}</td>
                          <td className="py-3 px-6">₹{product.price}</td>
                          <td className="py-3 px-9">{product.sales || 0}</td>
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
                        </tr>
                      ))}

                    </tbody>
                  </table>

                </div>

              )}
            </Card>

            <Link to="/add-product">
              <Button className="mt-4 flex justify-center w-[700px] bg-white text-black font-semibold text-2xl rounded-2xl">Add Product</Button>
            </Link>


          </div>

          {/* Account Information Sidebar */}
          <Card className="p-6 bg-[#2B2B2B] rounded-xl ml-[50px] shadow-md  w-[300px] h-[420px] ">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
              <p>User ID (Sub): <span className="text-white">{brandInfo?.user_id}</span></p>
              <p>Company: <span className="text-white">{brandInfo?.name}</span></p>
              <p>Email: <span className="text-white">{brandInfo?.email}</span></p>
              <p>Name: <span className="text-white">{brandInfo?.owner_name}</span></p>
              <p>Phone Number: <span className="text-white">{brandInfo?.phone}</span></p>
              <p>Instagram Handle: <span className="text-white">@{brandInfo?.instagram_handle}</span></p>
              <p>Role: <span className="text-green-400">{brandInfo?.role}</span></p>
              <p>Products Uploaded: <span className="text-white">{brandInfo?.product_count}</span></p>
              <p>Account Status: <span className="text-green-400">{brandInfo?.account_status}</span></p>
              <p>Joined: <span className="text-white">{brandInfo?.joined_date}</span></p>
            </div>
          </Card>

        </div>

      </div>
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} className="relative z-50">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel className="w-full max-w-2xl bg-[#1e1e1e] text-white rounded-xl shadow-xl p-6 flex flex-col max-h-[90vh]">
            {/* Title */}
            <Dialog.Title className="text-xl font-bold mb-6">Edit Brand Info</Dialog.Title>

            {/* Form Content */}
            <form onSubmit={handleSubmit(handleSave)} className="flex flex-col flex-grow space-y-6 overflow-y-auto pr-4 pl-4">

              {/* Section: Company Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200">Company Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm">Company</label>
                    <input {...register("name")} className="w-full p-2 rounded bg-[#121212] border border-gray-700" />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm">Instagram Handle</label>
                    <input {...register("instagram_handle")} className="w-full p-2 rounded bg-[#121212] border border-gray-700" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">name</label>
                    <input {...register("name")} className="w-full p-2 rounded bg-[#121212] border border-gray-700" />
                  </div>





                  <div>
                    <label className="block mb-1 text-sm">Brand Image</label>

                    {previewImage || existingImageUrl ? (
                      <div className="relative w-32 h-32 mb-2">
                        <img
                          src={previewImage || existingImageUrl}
                          alt="Brand preview"
                          className="object-cover w-full h-full rounded border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (previewImage) {
                              URL.revokeObjectURL(previewImage)
                            }
                            setPreviewImage("")
                            setBrandImageFile(null)
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
                        htmlFor="brand-image"
                        className="block w-full p-4 text-center border border-dashed border-gray-600 rounded cursor-pointer bg-[#121212] text-gray-400"
                      >
                        Click to upload image
                        <input
                          id="brand-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                              const previewUrl = URL.createObjectURL(file)
                              setPreviewImage(previewUrl)
                              setBrandImageFile(file)
                              setExistingImageUrl("") // Clear existing image if replacing
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

              {/* Section: Locations */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-200">Available in (up to 10 cities)</h3>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`locations.${index}.value`)}
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
                      + Add another city
                    </button>
                  )}
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

export default BrandDashboard
