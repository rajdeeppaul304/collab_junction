"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import BrandAPI from "../brandApi"

const AddProduct = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    sizes: [],
    images: [],
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [previewImages, setPreviewImages] = useState([])

  const categories = [
    "T-shirts",
    "Hoodies",
    "Shoes",
    "Accessories",
    "Electronics",
    "Beauty",
    "Home",
    "Fitness",
    "Other",
  ]

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSizeToggle = (size) => {
    setFormData((prev) => {
      const newSizes = prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size]

      return {
        ...prev,
        sizes: newSizes,
      }
    })
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)

    if (files.length > 0) {
      // Create preview URLs
      const newPreviewImages = files.map((file) => URL.createObjectURL(file))
      setPreviewImages((prev) => [...prev, ...newPreviewImages])

      // Add to form data
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }))
    }
  }

  const removeImage = (index) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index])

    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.price) {
      newErrors.price = "Price is required"
    } else if (isNaN(formData.price) || Number.parseFloat(formData.price) < 0) {
      newErrors.price = "Price must be a valid number"
    }

    if (formData.sizes.length === 0) {
      newErrors.sizes = "At least one size must be selected"
    }

    if (formData.images.length === 0) {
      newErrors.images = "At least one image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Create FormData object for file upload
      const productData = new FormData()
      productData.append("name", formData.name)
      productData.append("category", formData.category)
      productData.append("description", formData.description)
      productData.append("price", formData.price)
      formData.sizes.forEach((size) => {
        productData.append("sizes[]", size)
      })
      formData.images.forEach((image) => {
        productData.append("images", image)
      })

      await BrandAPI.post("/products", productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      alert("Product added successfully!")
      navigate("/manage-products")
    } catch (error) {
      console.error("Error adding product:", error)
      setErrors({
        general: error.response?.data?.message || "Failed to add product",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <Button variant="outline" onClick={() => navigate("/manage-products")}>
            Cancel
          </Button>
        </div>

        <Card className="p-6">
          {errors.general && (
            <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-2 rounded-md mb-6">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Product Name"
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                </div>

                <Input
                  label="Price (₹)"
                  name="price"
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={errors.price}
                />
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`
                          px-4 py-2 rounded-md
                          ${formData.sizes.includes(size) ? "bg-yellow-400 text-black" : "bg-gray-800 text-white"}
                        `}
                        onClick={() => handleSizeToggle(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {errors.sizes && <p className="mt-1 text-sm text-red-500">{errors.sizes}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">Product Images</label>
                  <div className="border-2 border-dashed border-gray-700 rounded-md p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-images"
                    />
                    <label htmlFor="product-images" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mb-2 text-gray-400"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className="text-gray-400">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </label>
                  </div>
                  {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
                </div>

                {previewImages.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-300">Preview</label>
                    <div className="grid grid-cols-3 gap-2">
                      {previewImages.map((src, index) => (
                        <div key={index} className="relative">
                          <img
                            src={src || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding Product..." : "Add Product"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}

export default AddProduct
