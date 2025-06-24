"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import API from "../api"
import BrandAPI from "../brandApi"
import getImageUrl from "../utils/getImageUrl"

import { useAuth } from "../context/AuthContext"


const BrandDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeCollaborations: 0,
    totalReach: 0,
    pendingRequests: 0,
  })
  const [products, setProducts] = useState([])
  const [creators, setCreators] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [recentInterests, setRecentInterests] = useState([])

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      // ... other fetches

      const interestsRes = await BrandAPI.get("/interests/recent")
      setRecentInterests(interestsRes.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  fetchDashboardData()
}, [])
  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const statsRes = await BrandAPI.get("/stats")
      console.log("Stats:", statsRes.data)

      const productsRes = await BrandAPI.get("/products?limit=4")
      console.log("Products:", productsRes.data)

      const creatorsRes = await BrandAPI.get("/recommended-creators?limit=4")
      console.log("Creators:", creatorsRes.data)

      setStats(statsRes.data)
      setProducts(productsRes.data)
      setCreators(creatorsRes.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }


    fetchDashboardData()
  }, [])

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Brand Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.name}</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Link to="/add-product">
              <Button>Add New Product</Button>
            </Link>
            <Link to="/manage-products">
              <Button variant="outline">Manage Products</Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { title: "Total Products", value: stats.totalProducts, icon: "📦" },
                { title: "Creator Interests", value: stats.interests, icon: "🤝" },
                { title: "Total Reach", value: `${stats.totalReach}K`, icon: "📈" },
                { title: "Pending Requests", value: stats.pendingRequests, icon: "⏳" },
              ].map((stat, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center">
                    <div className="mr-4 text-2xl">{stat.icon}</div>
                    <div>
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Your Products */}
            <Card className="mb-8 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your Products</h2>
                <Link to="/manage-products">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">You haven't added any products yet.</p>
                  <Link to="/add-product">
                    <Button>Add Your First Product</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                      
                      <div className="p-3">
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-yellow-400">₹{product.price}</p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.status === "active"
                                ? "bg-green-400/20 text-green-400"
                                : "bg-gray-400/20 text-gray-400"
                            }`}
                          >
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Link to={`/products/${product.id}/edit`} fullWidth>
                            <Button variant="outline" fullWidth>
                              Edit
                            </Button>
                          </Link>

                          <Link to={`/product/${product.id}`}  fullWidth>
                            <Button fullWidth>
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recommended Creators */}
            <Card className="mb-8 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recommended Creators</h2>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {creators.map((creator) => (
                  <div key={creator.id} className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="h-40 bg-gray-700"></div>
                    <div className="p-3">
                      <h3 className="font-medium">{creator.name}</h3>
                      <p className="text-gray-400 text-sm">{creator.category}</p>
                      <p className="text-yellow-400 my-1">{creator.followers} Followers</p>
                      <Link to={`/brand/creator-profile/${creator.id}`}>
                        <Button variant="outline" size="sm" fullWidth>
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Interests */}
            <Card className="p-6 mb-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">Recent Interests</h2>
    <Link to="/brand/interests">
      <Button variant="ghost" size="sm">View All</Button>
    </Link>
  </div>

  {recentInterests.length === 0 ? (
    <p className="text-gray-400">No recent interests yet.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-2">Creator</th>
            <th className="text-left py-3 px-2">Product</th>
            <th className="text-left py-3 px-2">Interest Date</th>
            <th className="text-left py-3 px-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {recentInterests.map((item, index) => (
            <tr key={index} className="border-b border-gray-800">
              <td className="py-3 px-2">{item.creator_name}</td>
              <td className="py-3 px-2">{item.product_name}</td>
              <td className="py-3 px-2">{new Date(item.created_at).toLocaleDateString()}</td>
              <td className="py-3 px-2">
                <Link to={`/brand/creator-profile/${item.creator_id}`}>
                  <Button variant="outline" size="sm">View Profile</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</Card>

          </>
        )}
      </div>
    </MainLayout>
  )
}

export default BrandDashboard
