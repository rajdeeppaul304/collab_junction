"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ShoppingCart, Settings, Plus, Edit, Trash2 } from "lucide-react"
import axios from "axios"

export default function BrandDashboardPage() {
  const { user, isLoaded } = useUser()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchData()
    }
  }, [isLoaded, user])

  const fetchData = async () => {
    try {
      // Fetch brand's products
      const productsResponse = await axios.get("/api/products?brandId=" + user.id)
      setProducts(productsResponse.data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products/${productId}`)
        // Refresh products list
        fetchData()
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Brand Dashboard</h1>
        <div className="bg-[#111] rounded-3xl p-8 flex justify-center items-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
          <p className="text-white ml-2">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Brand Dashboard</h1>

      <Tabs defaultValue="products" className="bg-[#111] rounded-3xl p-8">
        <TabsList className="bg-[#222] mb-8">
          <TabsTrigger value="products" className="data-[state=active]:bg-[#333]">
            <Package className="mr-2 h-4 w-4" />
            My Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-[#333]">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#333]">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Products</h2>
            <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
              <Link href="/dashboard/brand/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="bg-[#222] rounded-xl p-8 text-center">
              <p className="text-white mb-4">You haven't added any products yet.</p>
              <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
                <Link href="/dashboard/brand/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="bg-[#222] border-none">
                  <div className="relative aspect-square">
                    <Image
                      src={product.image || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    {product.featured && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                        Featured
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{product.category}</p>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-green-400 font-bold">
                      {product.discountPrice ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">₹{product.price}</span>₹
                          {product.discountPrice}
                        </>
                      ) : (
                        `₹${product.price}`
                      )}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 bg-transparent text-white border-white hover:bg-[#333]"
                    >
                      <Link href={`/dashboard/brand/products/${product.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-transparent text-red-500 border-red-500 hover:bg-red-500/10"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <h2 className="text-2xl font-bold text-white mb-6">Orders</h2>

          <div className="bg-[#222] rounded-xl p-8 text-center">
            <p className="text-white mb-4">Track orders from creators who purchased your products.</p>
            <p className="text-gray-400">Order management features coming soon.</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <h2 className="text-2xl font-bold text-white mb-6">Brand Settings</h2>

          <div className="bg-[#222] rounded-xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="relative aspect-square w-full max-w-[300px] mx-auto">
                  <Image
                    src={user?.imageUrl || "/placeholder.svg?height=300&width=300"}
                    alt={user?.fullName || "Brand"}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>

              <div className="md:w-2/3">
                <h3 className="text-xl font-bold text-white mb-2">{user?.fullName}</h3>
                <p className="text-gray-400 mb-4">{user?.primaryEmailAddress?.emailAddress}</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Role</p>
                    <p className="text-yellow-400 font-bold">Brand</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm">Member Since</p>
                    <p className="text-white">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
                    <Link href="/profile">Edit Profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
