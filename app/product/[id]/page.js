"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft, Loader2 } from "lucide-react"
import axios from "axios"

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState("23:59:59")

  useEffect(() => {
    fetchProduct()

    // Simulate countdown timer
    const interval = setInterval(() => {
      const [hours, minutes, seconds] = timeRemaining.split(":").map(Number)
      let newSeconds = seconds - 1
      let newMinutes = minutes
      let newHours = hours

      if (newSeconds < 0) {
        newSeconds = 59
        newMinutes -= 1
      }

      if (newMinutes < 0) {
        newMinutes = 59
        newHours -= 1
      }

      if (newHours < 0) {
        newHours = 23
      }

      setTimeRemaining(
        `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`,
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [params.id, timeRemaining])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${params.id}`)
      setProduct(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching product:", error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[#111] rounded-3xl mt-6 p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        <p className="text-white ml-2">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-[#111] rounded-3xl mt-6 p-8 text-center">
        <p className="text-white text-xl mb-4">Product not found</p>
        <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    )
  }

  // Sample sizes for demonstration
  const sizes = ["S", "M", "L", "XL", "XXL"]

  return (
    <div className="bg-[#111] rounded-3xl mt-6 overflow-hidden">
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6">
          <Link href="/store" className="text-white flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Store
          </Link>
          <span className="text-gray-500 mx-2">{"<"}</span>
          <Link href={`/store?category=${product.category}`} className="text-gray-400">
            {product.category || "All Products"}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
              <Image
                src={product.image || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex gap-2">
              {(product.images || []).slice(0, 3).map((image, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border-2 border-red-500">
                  <Image
                    src={image || "/placeholder.svg?height=100&width=100"}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="bg-[#222] inline-block px-4 py-1 rounded-full text-white mb-4">
              {product.category || "Product"}
            </div>

            <h1 className="text-4xl font-bold text-white mb-1">{product.name}</h1>
            <p className="text-gray-300 mb-4">By {product.brandName}</p>

            <div className="bg-[#222] inline-block px-4 py-2 rounded-full text-white mb-6">
              Order in {timeRemaining} to get the discount
            </div>

            <div className="mb-6">
              {product.discountPrice ? (
                <>
                  <span className="text-gray-400 text-2xl line-through mr-3">
                    ₹{Number.parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className="text-green-500 text-3xl font-bold">
                    ₹{Number.parseFloat(product.discountPrice).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-green-500 text-3xl font-bold">
                  ₹{Number.parseFloat(product.price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold mb-2">Description:</h3>
              <p className="text-gray-300">{product.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-white font-bold mb-2">Select Size:</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size, index) => (
                  <Button
                    key={index}
                    variant={selectedSize === size ? "default" : "outline"}
                    className={`rounded-full w-16 ${
                      selectedSize === size ? "bg-black text-white" : "bg-white text-black"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-white text-black hover:bg-gray-200 rounded-full">Contact the company</Button>
              <Button variant="outline" size="icon" className="rounded-full bg-white">
                <Heart className="h-5 w-5 text-black" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
