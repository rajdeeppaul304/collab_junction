"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Button from "../components/ui/Button"
import { useAuth } from "../context/AuthContext"
import CreatorAPI from "../creatorApi"
import getImageUrl from "../utils/getImageUrl"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, userRole } = useAuth()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isInterested, setIsInterested] = useState(false)
  const [loadingInterest, setLoadingInterest] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const thumbnailContainerRef = useRef(null)

  const scrollThumbnails = (direction) => {
    const container = thumbnailContainerRef.current
    if (!container) return
    const scrollAmount = 100
    container.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await CreatorAPI.get(`/products/${id}`)
        setProduct(response.data)

        if (response.data?.category) {
          const relatedRes = await CreatorAPI.get("/products", {
            params: { category: response.data.category, limit: 4 },
          })
          const filtered = relatedRes.data.filter((p) => p.id !== Number.parseInt(id)).slice(0, 4)
          setRelatedProducts(filtered)
        }

        if (isAuthenticated && userRole === "CREATOR") {
          const interestRes = await CreatorAPI.get(`/products/${id}/interest`)
          setIsInterested(interestRes.data.isInterested)
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load product details")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id, isAuthenticated, userRole])

  const handleInterest = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    if (userRole !== "CREATOR") {
      alert("Only creators can express interest in products")
      return
    }
    try {
      setLoadingInterest(true)
      if (isInterested) {
        await CreatorAPI.delete(`/products/${id}/interest`)
        setIsInterested(false)
        alert("Interest removed successfully!")
      } else {
        await CreatorAPI.post(`/products/${id}/interest`)
        setIsInterested(true)
        alert("Interest registered successfully!")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to update interest")
    } finally {
      setLoadingInterest(false)
    }
  }

  const ProductCard = ({ product: cardProduct }) => (
    <Link to={`/product/${cardProduct.id}`}>
      <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
        <div className="h-48 overflow-hidden">
          <img
            src={getImageUrl(cardProduct.image) || "/placeholder.svg"}
            alt={cardProduct.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              e.target.src = "/placeholder.svg"
            }}
          />
        </div>
        <div className="p-3">
          <h3 className="font-medium text-white">{cardProduct.name}</h3>
          <p className="text-gray-400 text-sm">By {cardProduct.brand}</p>
          <p className="text-yellow-400 my-1">Rs. {cardProduct.price?.toLocaleString()}</p>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.preventDefault()
              if (userRole === "CREATOR") {
                console.log("Interest in product:", cardProduct.id)
              }
            }}
          >
            I'm interested
          </Button>
        </div>
      </div>
    </Link>
  )

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </MainLayout>
    )
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error || "Product not found"}</p>
          <Link to="/store">
            <Button>Back to Store</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 w-full max-w-[1300px]">
        {/* Outer Light Grey Box */}
        <div className="bg-[#2B2B2B] rounded-lg p-6 space-y-8">
          {/* Breadcrumb */}
          <div className="text-gray-600 hover:text-gray-800">
            <Link to="/store" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Store <span className="mx-2">{">"}</span> {product.category}
            </Link>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="rounded-xl p-4 w-full max-w-md mx-auto md:max-w-none">
              {/* Image container with relative positioning */}
              <div className="relative overflow-hidden rounded-lg">
                {/* Main Image */}
                <img
                  src={getImageUrl(selectedImage || product.image)}
                  alt={product.name}
                  className="w-full max-w-[400px] h-[300px] md:h-[450px] object-cover rounded-lg mx-auto"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg"
                  }}
                />

                {/* Thumbnails OVER main image on desktop, below on mobile */}
                {product.images?.length > 0 && (
                  <>
                    {/* Desktop thumbnails (overlay, horizontal) */}
<div className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2 gap-2 p-2 rounded-md z-10">
  {product.images.slice(0, 6).map((img, index) => (
    <div
      key={index}
      className={`w-12 h-12 rounded-md overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
        selectedImage === img ? "border-yellow-400" : "border-white/30"
      }`}
      onClick={() => setSelectedImage(img)}
    >
      <img
        src={getImageUrl(img) || "/placeholder.svg"}
        alt={`Thumbnail ${index + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = "/placeholder.svg"
        }}
      />
    </div>
  ))}
</div>


                    {/* Mobile thumbnails (below image) */}
                    <div className="md:hidden mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
                      {product.images.slice(0, 6).map((img, index) => (
                        <div
                          key={index}
                          className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                            selectedImage === img ? "border-yellow-400" : "border-white/30"
                          }`}
                          onClick={() => setSelectedImage(img)}
                        >
                          <img
                            src={getImageUrl(img) || "/placeholder.svg"}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Details Column */}
            <div>
              <div className="bg-[#2B2B2B] rounded-lg p-6 space-y-6">
                <div className="inline-block bg-[#171717] border border-white text-white px-6 md:px-10 py-2 rounded-full mb-4 text-lg md:text-xl w-auto">
                  {product.category}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{product.name}</h1>
                  <p className="text-gray-400">By {product.brand}</p>
                </div>

                <div className="mb-6">
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-gray-400 line-through text-xl mr-2">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-yellow-400 text-2xl md:text-3xl font-bold">
                    ₹{product.price?.toLocaleString()}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">Description:</h3>
                  <p className="text-gray-300 text-sm md:text-base">
                    {product.description || "High-quality product perfect for creators and professionals."}
                  </p>
                </div>

                {product.specifications && (
                  <div className="mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Specifications:</h3>
                    <div className="text-gray-300 text-sm md:text-base">
                      {typeof product.specifications === "string"
                        ? product.specifications
                        : JSON.stringify(product.specifications, null, 2)}
                    </div>
                  </div>
                )}

                <div>
                  {userRole === "CREATOR" ? (
                    <Button
                      onClick={handleInterest}
                      className={`w-full py-3 text-lg font-semibold rounded-2xl transition-all duration-200 ${
                        isInterested
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-yellow-400 hover:bg-yellow-700 text-white"
                      }`}
                      disabled={loadingInterest}
                    >
                      {loadingInterest ? "Processing..." : isInterested ? "Interested ✔" : "I'm Interested"}
                    </Button>
                  ) : (
                    <div className="w-full">
                      <Button
                        disabled
                        className="w-full py-3 text-lg font-medium rounded-2xl text-black cursor-not-allowed rounded-[50px]"
                      >
                        Only creators can express interest
                      </Button>
                      <p className="mt-2 text-sm text-gray-500 text-center">
                        Sign in as a creator to show your interest in this product.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ProductDetail

