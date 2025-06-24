"use client"

import { useState, useEffect } from "react"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import CreatorAPI from "../creatorApi"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import getImageUrl from "../utils/getImageUrl"

const CreatorDashboard = () => {
  const { user } = useAuth()
  const [interests, setInterests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await CreatorAPI.get("/interests")
        setInterests(res.data)
      } catch (err) {
        console.error("Failed to fetch interests:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterests()
  }, [])

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.name}</p>
          </div>
          <Button as={Link} to="/creator/profile">View Profile</Button>
        </div>

        {/* Shown Interests Section */}
        <Card className="mb-8 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Shown Interests</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : interests.length === 0 ? (
            <p className="text-gray-400 text-center">You haven't shown interest in any products yet.</p>
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

        {/* Recommended Products placeholder can stay here */}
      </div>
    </MainLayout>
  )
}

export default CreatorDashboard
