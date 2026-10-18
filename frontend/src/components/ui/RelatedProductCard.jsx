"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import getImageUrl from "../../utils/getImageUrl"
import CreatorAPI from "../../creatorApi"

const RelatedProductCard = ({ cardProduct, userRole, isAuthenticated }) => {
  const navigate = useNavigate()
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
      await CreatorAPI.post(`/products/${cardProduct.id}/interest`, {})
      setStatus("done")
    } catch (err) {
      console.error("Error expressing interest:", err)
      setStatus("error")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="h-full"
    >
      <Link
        to={`/product/${cardProduct.id}`}
        className="block h-full bg-[#1F1F1F] rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/5 transition-all duration-300"
      >
        <div className="h-40 overflow-hidden">
          <img
            src={getImageUrl(cardProduct.image)}
            alt={cardProduct.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg" }}
          />
        </div>
        <div className="p-3">
          <h3 className="font-medium text-white truncate">{cardProduct.name}</h3>
          <p className="text-gray-400 text-sm">By {cardProduct.brand}</p>
          <p className="text-yellow-400 my-1 font-semibold">Rs. {cardProduct.price?.toLocaleString()}</p>
          <button
            onClick={handleInterest}
            disabled={status === "loading" || status === "done"}
            className="w-full mt-1 border border-yellow-400/60 hover:bg-yellow-400 hover:text-black text-sm text-yellow-400 font-medium rounded-md py-1.5 transition-colors duration-200 disabled:opacity-60 cursor-pointer"
          >
            {status === "loading" ? "Sending..." : status === "done" ? "Interest sent \u2713" : "I'm interested"}
          </button>
          {status === "error" && userRole !== "CREATOR" && isAuthenticated && (
            <p className="text-red-400 text-xs mt-1 text-center">Only creators can express interest</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default RelatedProductCard
