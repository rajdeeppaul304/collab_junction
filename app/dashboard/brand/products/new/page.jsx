"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import axios from "axios"

export default function NewProductPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    image: "",
    featured: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, featured: checked }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format price values
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        discountPrice: formData.discountPrice ? Number.parseFloat(formData.discountPrice) : null,
      }

      await axios.post("/api/products", productData)
      router.push("/dashboard/brand")
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Failed to create product. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <Button asChild variant="ghost" className="text-white mr-4">
          <Link href="/dashboard/brand">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-white">Add New Product</h1>
      </div>

      <div className="bg-[#111] rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Product Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-[#222] border-[#333] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="bg-[#222] border-[#333] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="bg-[#222] border-[#333] text-white min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-white">
                Price (₹)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
                className="bg-[#222] border-[#333] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPrice" className="text-white">
                Discount Price (₹) (Optional)
              </Label>
              <Input
                id="discountPrice"
                name="discountPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.discountPrice}
                onChange={handleChange}
                className="bg-[#222] border-[#333] text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-white">
              Image URL
            </Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="bg-[#222] border-[#333] text-white"
            />
            <p className="text-gray-400 text-sm">
              Enter a URL for your product image. Image upload functionality coming soon.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="featured" checked={formData.featured} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="featured" className="text-white">
              Feature this product on the store
            </Label>
          </div>

          <Button type="submit" disabled={isSubmitting} className="bg-yellow-400 text-black hover:bg-yellow-500">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Product...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
