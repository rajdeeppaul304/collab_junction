"use client"

import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import Button from "./Button"
import { useAuth } from "../../context/AuthContext"
import CreatorAPI from "../../creatorApi"
import getImageUrl from "../../utils/getImageUrl"

const ProductCard = ({ product }) => {
  const { isAuthenticated, userRole } = useAuth()
  const navigate = useNavigate()
  const { id, name, company, brand, price, image } = product
  const [status, setStatus] = useState("idle") // idle | loading | done | error

  const handleInterest = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      navigate("/signin")
      return
    }

    if (userRole !== "CREATOR") {
      setStatus("error")
      return
    }

    setStatus("loading")
    try {
      await CreatorAPI.post(`/products/${id}/interest`, {})
      setStatus("done")
    } catch (error) {
      console.error("Error expressing interest:", error)
      setStatus("error")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="bg-gray-900 rounded-xl overflow-hidden flex flex-col h-full border border-gray-800 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/5 transition-colors duration-300"
    >
      <Link to={`/product/${id}`}>
        <div className="h-48 overflow-hidden relative">
          <img
            src={getImageUrl(image)}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-108"
            onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg" }}
          />
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-grow">
        <Link to={`/product/${id}`}>
          <h3 className="text-white font-medium hover:text-yellow-400 line-clamp-1">{name}</h3>
        </Link>
        <p className="text-gray-400 text-sm">By {company || brand}</p>
        <p className="text-yellow-400 my-1">Rs. {price}</p>
        <div className="mt-auto pt-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={handleInterest}
            disabled={status === "loading" || status === "done"}
          >
            {status === "loading" ? "Sending..." : status === "done" ? "Interest sent \u2713" : "I'm interested"}
          </Button>
          {status === "error" && (
            <p className="text-red-400 text-xs mt-1 text-center">
              {userRole !== "CREATOR" ? "Only creators can express interest" : "Something went wrong, try again"}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
