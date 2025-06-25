"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Button from "../components/ui/Button"
import { useAuth } from "../context/AuthContext"
import CreatorAPI from "../creatorApi"
import BrandAPI from "../brandApi"

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
  const [checkingInterest, setCheckingInterest] = useState(true)

  const [loadingInterest, setLoadingInterest] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [productAnalytics, setProductAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [errorAnalytics, setErrorAnalytics] = useState(null)
  const [showInterestModal, setShowInterestModal] = useState(false)
  const [interestStep, setInterestStep] = useState(1)
const [step1Data, setStep1Data] = useState({
  selectedOptions: {}
});
  const [step2Data, setStep2Data] = useState({
    note: "",
    address: "",
  })

  const [submittingInterest, setSubmittingInterest] = useState(false)

  const thumbnailContainerRef = useRef(null)

  const scrollThumbnails = (direction) => {
    const container = thumbnailContainerRef.current
    if (!container) return
    const scrollAmount = 100
    container.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await BrandAPI.get(`/products/${id}/analytics`)
        setProductAnalytics(res.data)
      } catch (err) {
        setErrorAnalytics("Failed to load analytics")
      } finally {
        setLoadingAnalytics(false)
      }
    }

    if (
      product?.id &&
      userRole === "BRAND"
    ) {
      fetchAnalytics()
    }
  }, [product?.id, userRole])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await CreatorAPI.get(`/products/${id}`)
        setProduct(response.data)

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

        if (isAuthenticated && userRole === "CREATOR") {
          setCheckingInterest(true)
          try {
            const interestRes = await CreatorAPI.get(`/products/${id}/interest`)
            setIsInterested(interestRes.data.isInterested)
          } catch (err) {
            setIsInterested(false)
          } finally {
            setCheckingInterest(false)
          }
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

  const handleInterest = () => {
    if (checkingInterest) return // prevent early action

    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    if (userRole !== "CREATOR") {
      alert("Only creators can express interest in products")
      return
    }

    if (isInterested) return // already shown interest

    setShowInterestModal(true)
    setInterestStep(1)
  }
// Helper function to check if all required options are selected
const areAllOptionsSelected = () => {
  if (!product?.options || product.options.length === 0) return true;
  
  const selectedOptions = step1Data.selectedOptions || {};
  return product.options.every(option => {
    return selectedOptions[option.name] && selectedOptions[option.name].trim() !== '';
  });
};

// Make sure to initialize step1Data with selectedOptions



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

        {userRole === "BRAND" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Product Analytics</h2>

            {loadingAnalytics ? (
              <p className="text-gray-400">Loading analytics...</p>
            ) : errorAnalytics ? (
              <p className="text-red-400">{errorAnalytics}</p>
            ) : productAnalytics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-white">
                <div className="p-4 bg-gray-800 rounded-lg shadow">
                  <p className="text-sm text-gray-400">Views</p>
                  <p className="text-xl font-semibold">{productAnalytics.views}</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg shadow">
                  <p className="text-sm text-gray-400">Interest Count</p>
                  <p className="text-xl font-semibold">{productAnalytics.interestCount}</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg shadow">
                  <p className="text-sm text-gray-400">Conversion Rate</p>
                  <p className="text-xl font-semibold">{productAnalytics.conversionRate}%</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No analytics data available.</p>
            )}
          </div>
        )}


      </div>

      {/* interest modal here */}


{showInterestModal && (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto text-black">
    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
        <button
          onClick={() => setShowInterestModal(false)}
          className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold">
          {interestStep === 1 ? "Customize Your Product" : "Final Details"}
        </h2>
        <p className="text-white/90 mt-1">
          {interestStep === 1 ? "Select your preferred options" : "Complete your interest form"}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
          style={{ width: interestStep === 1 ? "50%" : "100%" }}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {interestStep === 1 && (
          <div className="space-y-6">
            {/* Product Options */}
            {product?.options && product.options.length > 0 ? (
              <div className="space-y-5">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Options</h3>
                  <p className="text-gray-600">Select your preferred configuration</p>
                </div>

                {product.options.map((option, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 capitalize">
                      {option.name || `Option ${index + 1}`}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    
                    {option.type === 'select' || !option.type ? (
                      <select
                        className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={step1Data.selectedOptions?.[option.name] || ''}
                        onChange={(e) => setStep1Data({
                          ...step1Data,
                          selectedOptions: {
                            ...step1Data.selectedOptions,
                            [option.name]: e.target.value
                          }
                        })}
                      >
                        <option value="">Select {option.name}</option>
                        {option.values?.map((value, valueIndex) => (
                          <option key={valueIndex} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    ) : option.type === 'radio' ? (
                      <div className="grid grid-cols-2 gap-3">
                        {option.values?.map((value, valueIndex) => (
                          <label key={valueIndex} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                            <input
                              type="radio"
                              name={option.name}
                              value={value}
                              checked={step1Data.selectedOptions?.[option.name] === value}
                              onChange={(e) => setStep1Data({
                                ...step1Data,
                                selectedOptions: {
                                  ...step1Data.selectedOptions,
                                  [option.name]: e.target.value
                                }
                              })}
                              className="mr-3 text-blue-600"
                            />
                            <span className="text-gray-700">{value}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder={`Enter ${option.name}`}
                        value={step1Data.selectedOptions?.[option.name] || ''}
                        onChange={(e) => setStep1Data({
                          ...step1Data,
                          selectedOptions: {
                            ...step1Data.selectedOptions,
                            [option.name]: e.target.value
                          }
                        })}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>No customization options available for this product</p>
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end pt-4">
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                disabled={product?.options?.length > 0 && !areAllOptionsSelected()}
                onClick={() => setInterestStep(2)}
              >
                Continue to Next Step
                <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {interestStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Almost Done!</h3>
              <p className="text-gray-600">Just need a few more details to complete your interest</p>
            </div>

            {/* Note to Company */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Send note to company
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="4"
                placeholder="Write your message..."
                value={step2Data.note}
                onChange={(e) => setStep2Data({ ...step2Data, note: e.target.value })}
              />
            </div>

            {/* Current Address */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Enter your current address
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full address"
                value={step2Data.address}
                onChange={(e) => setStep2Data({ ...step2Data, address: e.target.value })}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md"
                onClick={() => setInterestStep(1)}
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                disabled={!step2Data.note?.trim() || !step2Data.address?.trim() || submittingInterest}
                onClick={async () => {
                  setSubmittingInterest(true)
                  try {
                    await CreatorAPI.post(`/products/${id}/interest`, {
                      ...step1Data,
                      ...step2Data,
                      selectedOptions: step1Data.selectedOptions || {}
                    })
                    setIsInterested(true)
                    alert("Interest registered successfully!")
                    setShowInterestModal(false)
                  } catch (err) {
                    console.error(err)
                    alert("Failed to submit interest")
                  } finally {
                    setSubmittingInterest(false)
                  }
                }}
              >
                {submittingInterest ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Interest
                    <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}



    </MainLayout>
  )
}

export default ProductDetail

