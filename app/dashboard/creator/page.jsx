"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, Clock, User, Heart } from "lucide-react"
import axios from "axios"

export default function CreatorDashboardPage() {
  const { user, isLoaded } = useUser()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [savedItems, setSavedItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchData()
    }
  }, [isLoaded, user])

  const fetchData = async () => {
    try {
      // Fetch products
      const productsResponse = await axios.get("/api/products?featured=true")
      setProducts(productsResponse.data)

      // Fetch orders
      const ordersResponse = await axios.get("/api/orders")
      setOrders(ordersResponse.data)

      // For now, use sample saved items
      setSavedItems([
        {
          id: 1,
          name: "Product Name",
          price: 300,
          category: "Category",
          image: "/placeholder.svg?height=300&width=300",
        },
        {
          id: 2,
          name: "Product Name",
          price: 300,
          category: "Category",
          image: "/placeholder.svg?height=300&width=300",
        },
      ])

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Creator Dashboard</h1>
        <div className="bg-[#111] rounded-3xl p-8 flex justify-center items-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
          <p className="text-white ml-2">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Creator Dashboard</h1>

      <Tabs defaultValue="browse" className="bg-[#111] rounded-3xl p-8">
        <TabsList className="bg-[#222] mb-8">
          <TabsTrigger value="browse" className="data-[state=active]:bg-[#333]">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-[#333]">
            <Clock className="mr-2 h-4 w-4" />
            My Orders
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-[#333]">
            <Heart className="mr-2 h-4 w-4" />
            Saved Items
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#333]">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Products</h2>

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
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                  <p className="text-gray-400 text-sm">by {product.brandName}</p>
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
                <CardFooter>
                  <Button asChild className="w-full bg-white text-black hover:bg-gray-200">
                    <Link href={`/product/${product.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
              <Link href="/store">Browse All Products</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <h2 className="text-2xl font-bold text-white mb-6">My Orders</h2>

          {orders.length === 0 ? (
            <div className="bg-[#222] rounded-xl p-8 text-center">
              <p className="text-white mb-4">You haven't placed any orders yet.</p>
              <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
                <Link href="/store">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="bg-[#222] border-none">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white">Order #{order.id}</CardTitle>
                      <div className="bg-[#333] px-3 py-1 rounded-full text-yellow-400 text-sm">{order.status}</div>
                    </div>
                    <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden">
                            <Image
                              src={item.productImage || "/placeholder.svg?height=100&width=100"}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-white">{item.productName}</p>
                            <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-green-400 font-bold">₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-white">
                      Total: <span className="text-green-400 font-bold">₹{order.totalAmount}</span>
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="bg-transparent text-white border-white hover:bg-[#333]"
                    >
                      <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <h2 className="text-2xl font-bold text-white mb-6">Saved Items</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedItems.map((item) => (
              <Card key={item.id} className="bg-[#222] border-none">
                <div className="relative aspect-square">
                  <Image
                    src={item.image || "/placeholder.svg?height=300&width=300"}
                    alt={item.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                  <p className="text-gray-400 text-sm">{item.category}</p>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-green-400 font-bold">₹{item.price}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button asChild className="flex-1 bg-white text-black hover:bg-gray-200">
                    <Link href={`/product/${item.id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" className="bg-transparent text-white border-white hover:bg-[#333]">
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <h2 className="text-2xl font-bold text-white mb-6">My Profile</h2>

          <div className="bg-[#222] rounded-xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="relative aspect-square w-full max-w-[300px] mx-auto">
                  <Image
                    src={user?.imageUrl || "/placeholder.svg?height=300&width=300"}
                    alt={user?.fullName || "Profile"}
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
                    <p className="text-yellow-400 font-bold">Creator</p>
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
