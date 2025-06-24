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

        // Fetch related products
        if (response.data?.category) {
          try {
            const relatedRes = await CreatorAPI.get("/products", {
              params: { 
                category: response.data.category,
                limit: 4 
              }
            })
            // Filter out current product and limit to 4
            const filtered = relatedRes.data
              .filter(p => p.id !== parseInt(id))
              .slice(0, 4)
            setRelatedProducts(filtered)
          } catch (err) {
            console.error("Error fetching related products:", err)
          }
        }

        // Check if user has expressed interest (only for creators)
        if (isAuthenticated && userRole === "CREATOR") {
          try {
            const interestRes = await CreatorAPI.get(`/products/${id}/interest`)
            setIsInterested(interestRes.data.isInterested)
          } catch (err) {
            // If interest check fails, assume not interested
            setIsInterested(false)
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product details")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, isAuthenticated, userRole])

  const handleInterest = async () => {
    if (!isAuthenticated) {
      navigate('/login')
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
      console.error("Error handling interest:", err)
      alert("Failed to update interest")
    } finally {
      setLoadingInterest(false)
    }
  }

  // const handleContactCompany = () => {
  //   if (!isAuthenticated) {
  //     navigate('/login')
  //     return
  //   }
    
  //   // For now, just show an alert. You can implement proper contact functionality later
  //   alert(`Contact request will be sent to ${product.brand}!`)
  // }

  const ProductCard = ({ product: cardProduct }) => (
    <Link to={`/product/${cardProduct.id}`}>
      <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
        <div className="h-48 overflow-hidden">
          <img
            src={getImageUrl(cardProduct.image)}
            // src={cardProduct.image || "/placeholder.svg"}
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
                // Handle interest for related product
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
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/store" className="flex items-center text-gray-400 hover:text-white">
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
            Store
            <span className="mx-2">{'>'}</span>
            {product.category}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
<div>
  {/* Main Product Image */}
  <div className="bg-gray-900 rounded-lg overflow-hidden mb-4 relative flex justify-center items-center">
    <a
      href={getImageUrl(selectedImage || product.image)}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-full max-h-[400px]"
    >
      <img
        src={getImageUrl(selectedImage || product.image)}
        alt={product.name}
        className="object-contain max-h-[400px] w-auto mx-auto"
        onError={(e) => {
          e.target.src = "/placeholder.svg"
        }}
      />
    </a>
  </div>

  {/* Scrollable Thumbnails */}
  {product.images?.length > 0 && (
    <div className="relative">
      {/* Left Arrow */}
      <button
        onClick={() => scrollThumbnails("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-full"
        aria-label="Scroll left"
      >
        ◀
      </button>

      {/* Thumbnails container */}
      <div
        ref={thumbnailContainerRef}
        className="flex overflow-x-auto no-scrollbar gap-3 px-10"
        style={{ scrollBehavior: "smooth", maxWidth: "100%" }}
      >
        {product.images.slice(0, 6).map((img, index) => (
          <div
            key={index}
            className={`flex-none h-24 w-24 cursor-pointer rounded-lg overflow-hidden border ${
              selectedImage === img ? "border-yellow-400" : "border-transparent"
            }`}
            onClick={() => setSelectedImage(img)}
          >
            <img
              src={getImageUrl(img)}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder.svg"
              }}
            />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scrollThumbnails("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-full"
        aria-label="Scroll right"
      >
        ▶
      </button>
    </div>
  )}
</div>



          {/* Product Details */}
          <div>
            <div className="bg-gray-900 rounded-lg p-6">
              {/* Category Badge */}
              <div className="inline-block bg-gray-800 px-4 py-1 rounded-full mb-4 text-sm">
                {product.category}
              </div>

              <h1 className="text-3xl font-bold mb-2 text-white">{product.name}</h1>
              <p className="text-gray-400 mb-4">By {product.brand}</p>

              {/* Price */}
              <div className="mb-6">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-gray-400 line-through text-xl mr-2">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-yellow-400 text-3xl font-bold">
                  ₹{product.price?.toLocaleString()}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-white">Description:</h3>
                <p className="text-gray-300">
                  {product.description || "High-quality product perfect for creators and professionals."}
                </p>
              </div>

              {/* Specifications */}
              {product.specifications && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-white">Specifications:</h3>
                  <div className="text-gray-300">
                    {typeof product.specifications === 'string' 
                      ? product.specifications
                      : JSON.stringify(product.specifications, null, 2)
                    }
                  </div>
                </div>
              )}

              {/* Action Button for Interest */}
<div className="mt-10">
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
      {loadingInterest
        ? "Processing..."
        : isInterested
        ? "Interested ✔"
        : "I'm Interested"}
    </Button>
  ) : (
    <div className="w-full">
      <Button
        disabled
        className="w-full py-3 text-lg font-medium rounded-2xl bg-gray-300 text-gray-600 cursor-not-allowed"
      >
        Only creators can express interest
      </Button>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Sign in as a creator to show your interest in this product.
      </p>
    </div>
  )}
</div>


              {/* Interest Status
              {userRole === "CREATOR" && isInterested && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                  <p className="text-green-400 text-sm">
                    ✓ You've expressed interest in this product
                  </p>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-white">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ProductDetail