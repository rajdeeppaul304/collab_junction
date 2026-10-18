import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import MainLayout from "../components/layout/MainLayout"
import CreatorAPI from "../creatorApi"
import getImageUrl from "../utils/getImageUrl"
import Button from "../components/ui/Button"

const Store = () => {
  const [products, setProducts] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [filters, setFilters] = useState({
    brand: "all",
    category: "all",
    price: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          CreatorAPI.get("/products/categories"),
          CreatorAPI.get("/products/brands"),
        ])
        setCategories(catRes.data)
        setBrands(brandRes.data)
      } catch (err) {
        console.error("Error fetching filter data:", err)
      }
    }
    fetchFilterData()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const params = {}
        if (searchQuery.trim()) params.search = searchQuery.trim()
        if (filters.category !== "all") params.category = filters.category
        if (filters.brand !== "all") params.brand = filters.brand
        if (filters.price !== "all") params.price = filters.price

        const [productRes, popularRes] = await Promise.all([
          CreatorAPI.get("/products", { params }),
          CreatorAPI.get("/products/popular"),
        ])
        setProducts(productRes.data)
        setPopularProducts(popularRes.data)
      } catch (err) {
        console.error("Error loading products:", err)
        setError("Failed to load products. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [filters, searchQuery])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const ProductCard = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="bg-[#1F1F1F] rounded-3xl border border-gray-700 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/5 overflow-hidden w-full min-w-[160px] sm:min-w-[200px] transition-colors duration-300"
    >
      <Link to={`/product/${product.id}`}>
        <div className="h-40 sm:h-52 overflow-hidden relative">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-108 transition-transform duration-500"
            onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.svg" }}
          />
        </div>
      </Link>
      <div className="p-3.5 flex flex-col justify-between min-h-[100px]">
        <div>
          <h3 className="text-white font-semibold text-base sm:text-lg truncate hover:text-yellow-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm truncate">By {product.brand || "Company"}</p>
          <p className="text-yellow-400 font-semibold text-sm mt-1">Rs. {product.price?.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  )

  const FilterDropdown = ({ title, filterKey, options }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-[180px] px-4 py-2 bg-[#444] text-white rounded-xl font-medium text-sm border border-[#555]"
        >
          <span>{title}</span>
          <svg
            className={`transition-transform transform ${isOpen ? "rotate-90" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {isOpen && (
          <div className="mt-1 w-[180px] bg-[#333] border border-[#555] rounded-md overflow-hidden">
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-[#444] text-white"
              onClick={() => {
                handleFilterChange(filterKey, "all")
                setIsOpen(false)
              }}
            >
              All {title}
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#444] text-white"
                onClick={() => {
                  handleFilterChange(filterKey, opt)
                  setIsOpen(false)
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#171717] text-white">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-4xl font-semibold mb-6 sm:mb-8">Product Catalog</h1>

          {/* Popular Products */}
          <section className="mb-8">
            <div className="bg-[#2E2E2E] rounded-xl px-4 sm:px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-normal mb-6 text-gray-300 mt-2">Popular Product</h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {isLoading
                  ? Array(5).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className="bg-[#4C4C4C] h-72 min-w-[180px] max-w-[200px] animate-pulse rounded-xl border border-white flex-shrink-0"
                      />
                    ))
                  : popularProducts.length === 0 ? (
                      <p className="text-gray-400 py-6">No popular products yet.</p>
                    ) : popularProducts.map((product) => (
                      <div key={product.id} className="flex-shrink-0">
                        <ProductCard product={product} />
                      </div>
                    ))}
              </div>
            </div>
          </section>

          <p className="text-2xl sm:text-4xl mb-6">All Products</p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Filters */}
            <div className="lg:col-span-3">
              <div className="bg-[#2B2B2B] p-6 rounded-3xl border border-gray-800 w-full lg:max-w-[230px]">
                <h3 className="text-xl sm:text-2xl font-normal mb-6">Sort / Filters:</h3>
                <div className="flex flex-wrap gap-2 lg:flex-col lg:space-y-2 lg:gap-0">
                  <FilterDropdown title="Brand" filterKey="brand" options={brands} />
                  <FilterDropdown title="Category" filterKey="category" options={categories} />
                  <FilterDropdown title="Price" filterKey="price" options={["Under 10k", "10k-50k", "50k-100k", "Above 100k"]} />
                </div>
              </div>
            </div>

            {/* Search + Products */}
            <div className="lg:col-span-9">
              <div className="bg-[#2B2B2B] p-4 sm:p-6 rounded-xl border border-gray-800">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 min-w-0 bg-[#4C4C4C] border text-white px-4 sm:px-6 py-3 rounded-l-full placeholder-gray-400 focus:outline-none"
                  />
                  <button type="submit" className="bg-white text-black px-5 sm:px-6 py-3 rounded-r-full hover:bg-gray-200 flex-shrink-0">
                    <svg width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </button>
                </form>

                {/* Product Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="bg-[#4C4C4C] h-72 rounded-xl animate-pulse border border-gray-300" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white mb-4">No products found.</p>
                    <button
                      onClick={() => {
                        setFilters({ brand: "all", category: "all", price: "all" })
                        setSearchQuery("")
                      }}
                      className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer shadow-md"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Store
