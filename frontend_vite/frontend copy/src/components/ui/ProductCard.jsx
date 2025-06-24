"use client"

import { Link } from "react-router-dom"
import Button from "./Button"
import { useAuth } from "../../context/AuthContext"
import API from "../../api" // Declare the API variable

const ProductCard = ({ product }) => {
  const { isAuthenticated, userRole } = useAuth()
  const { id, name, company, price, image } = product

  const handleInterest = async (e) => {
    e.preventDefault()
    // API call to express interest in product
    try {
      // Only creators can express interest
      if (userRole === "CREATOR") {
        await API.post(`/products/${id}/interest`)
        alert("Interest registered successfully!")
      } else {
        alert("Only creators can express interest in products")
      }
    } catch (error) {
      console.error("Error expressing interest:", error)
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <Link to={`/product/${id}`}>
        <div className="h-48 overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-3">
        <h3 className="text-white font-medium">{name}</h3>
        <p className="text-gray-400 text-sm">By {company}</p>
        <p className="text-yellow-400 my-1">Rs. {price}</p>
        <Button variant="outline" size="sm" fullWidth onClick={handleInterest}>
          I'm interested
        </Button>
      </div>
    </div>
  )
}

export default ProductCard
