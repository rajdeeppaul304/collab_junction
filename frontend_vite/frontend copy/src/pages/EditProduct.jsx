"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import BrandAPI from "../brandApi"
import getImageUrl from "../utils/getImageUrl"

const EditProduct = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    options: [], // Changed from sizes to options
    images: [],
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [deletedImages, setDeletedImages] = useState([])

  const categories = [
    "T-shirts", "Hoodies", "Shoes", "Accessories", "Electronics", "Beauty", "Home", "Fitness", "Other"
  ]

useEffect(() => {
  const fetchProduct = async () => {
    try {
      const { data } = await BrandAPI.get(`/products/${productId}`)
      
      // Transform the options data to match frontend structure
      const transformedOptions = (data.options || []).map((option, index) => ({
        id: Date.now() + index, // Generate unique ID for frontend
        name: option.name || "",
        values: option.values || [],
        currentValue: "", // Initialize empty input field
      }))
      
      setFormData({
        name: data.name || "",
        category: data.category || "",
        description: data.description || "",
        price: data.price || "",
        options: transformedOptions,
        images: [],
      })
      setPreviewImages(data.images || [])
    } catch (err) {
      console.error("Error fetching product", err)
      navigate("/error") // redirect to error page if 403 or 404
    }
  }

  fetchProduct()
}, [productId, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  // Add a new option
  const addOption = () => {
    if (formData.options.length < 5) {
      setFormData((prev) => ({
        ...prev,
        options: [
          ...prev.options,
          {
            id: Date.now(), // Simple ID generation
            name: "",
            values: [],
            currentValue: "", // For input field
          },
        ],
      }))
    }
  }

  // Remove an option
  const removeOption = (optionId) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((option) => option.id !== optionId),
    }))
  }

  // Update option name
  const updateOptionName = (optionId, name) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.id === optionId ? { ...option, name } : option
      ),
    }))
  }

  // Update current value input for an option
  const updateOptionCurrentValue = (optionId, currentValue) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.id === optionId ? { ...option, currentValue } : option
      ),
    }))
  }

  // Add value to an option
  const addValueToOption = (optionId) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option) => {
        if (option.id === optionId && option.currentValue.trim()) {
          const newValues = [...option.values, option.currentValue.trim()]
          return { ...option, values: newValues, currentValue: "" }
        }
        return option
      }),
    }))
  }

  // Remove value from an option
  const removeValueFromOption = (optionId, valueIndex) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.id === optionId
          ? { ...option, values: option.values.filter((_, i) => i !== valueIndex) }
          : option
      ),
    }))
  }

  // Handle key press for adding values
  const handleValueKeyPress = (e, optionId) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addValueToOption(optionId)
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newPreviewImages = files.map((file) => URL.createObjectURL(file))
    setPreviewImages((prev) => [...prev, ...newPreviewImages])
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }))
  }

  const removeImage = (index) => {
    const imageToRemove = previewImages[index]

    // If it's an existing image, track it for deletion
    if (!imageToRemove.startsWith("blob:")) {
      setDeletedImages((prev) => [...prev, imageToRemove])
    } else {
      URL.revokeObjectURL(imageToRemove)
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }))
    }

    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.price || isNaN(formData.price)) newErrors.price = "Valid price is required"
    
    // Validate options
    if (formData.options.length === 0) {
      newErrors.options = "At least one option must be added"
    } else {
      formData.options.forEach((option, index) => {
        if (!option.name.trim()) {
          newErrors[`option_name_${index}`] = "Option name is required"
        }
        if (option.values.length === 0) {
          newErrors[`option_values_${index}`] = "At least one value must be added"
        }
      })
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      const productData = new FormData()
      productData.append("name", formData.name)
      productData.append("category", formData.category)
      productData.append("description", formData.description)
      productData.append("price", formData.price)
      
      // Append options as JSON string (clean format without currentValue and IDs)
      const cleanOptions = formData.options.map(option => ({
        name: option.name,
        values: option.values
      }))
      productData.append("options", JSON.stringify(cleanOptions))
      
      formData.images.forEach((img) => productData.append("images", img))
      deletedImages.forEach((url) => productData.append("deleted_images[]", url))

      await BrandAPI.put(`/products/${productId}`, productData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      alert("Product updated successfully!")
      navigate("/manage-products")
    } catch (err) {
      console.error("Error updating product", err)
      setErrors({ general: "Failed to update product" })
    } finally {
      setIsLoading(false)
    }
  }

return (
  <MainLayout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
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
              {/* Product Options Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-300">Product Options</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    disabled={formData.options.length >= 5}
                  >
                    Add Option
                  </Button>
                </div>
                
                {errors.options && <p className="mb-2 text-sm text-red-500">{errors.options}</p>}

                <div className="space-y-4">
                  {formData.options.map((option, index) => (
                    <div key={option.id} className="border border-gray-700 rounded-md p-4">
                      <div className="flex justify-between items-center mb-3">
                        <Input
                          placeholder="Option name (e.g., Size, Color)"
                          value={option.name}
                          onChange={(e) => updateOptionName(option.id, e.target.value)}
                          error={errors[`option_name_${index}`]}
                          className="flex-1 mr-3"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(option.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="mb-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add value"
                            value={option.currentValue}
                            onChange={(e) => updateOptionCurrentValue(option.id, e.target.value)}
                            onKeyPress={(e) => handleValueKeyPress(e, option.id)}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addValueToOption(option.id)}
                            disabled={!option.currentValue.trim()}
                          >
                            Add
                          </Button>
                        </div>
                        {errors[`option_values_${index}`] && (
                          <p className="mt-1 text-sm text-red-500">{errors[`option_values_${index}`]}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value, valueIndex) => (
                          <span
                            key={valueIndex}
                            className="inline-flex items-center px-3 py-1 bg-yellow-400 text-black rounded-full text-sm"
                          >
                            {value}
                            <button
                              type="button"
                              onClick={() => removeValueFromOption(option.id, valueIndex)}
                              className="ml-2 hover:text-red-600"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                      <p className="text-sm text-gray-400">Click to upload or drag files</p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.startsWith("blob:") ? img : getImageUrl(img)}
                        alt={`Product ${index}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full px-2"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating Product..." : "Update Product"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </MainLayout>
)
}

export default EditProduct
