"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import CreatorAPI from "../creatorApi"
import getImageUrl from "../utils/getImageUrl"
import Button from "../components/ui/Button"

const Store = () => {
  const [products, setProducts] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    brand: "all",
    category: "all",
    color: "all",
    type: "all",
    price: "all",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CreatorAPI.get("/products/categories")
        setCategories(res.data)
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const params = {}
        if (searchQuery.trim()) params.search = searchQuery.trim()
        if (filters.category !== "all") params.category = filters.category

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
  <div className="bg-[#1F1F1F] rounded-3xl border border-gray-500 overflow-hidden w-full min-w-[220px] max-w-[250px] ">
    <Link to={`/product/${product.id}`}>
      <div className="h-52 overflow-hidden relative"> {/* Increased image height */}
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          onError={(e) => (e.target.src = "/placeholder.svg")}
        />
      </div>
    </Link>
    <div className="p-3 flex flex-col justify-between h-[140px]  "> {/* Increased content area */}
      <div>
        <h3 className="text-white font-semibold text-xl truncate ml-5">{product.name}</h3>
        <p className="text-white text-s ml-5">By {product.brand || "Company"}</p>
        <p className="text-green-400 text-s  ml-5">Rs. {product.price}</p>
      </div>
      
    </div>
  </div>
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
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-4xl font-semibold mb-8 ml-20 mt-4">Product Catalog</h1>

          {/* Popular Products */}
          <section className="mb-8">
            <div className="bg-[#2E2E2E] rounded-xl px-6 py-2 border border-gray-800 ml-20 mr-20">
              <h2 className="text-2xl font-normal mb-6 text-gray-300 mt-2">Popular Product</h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {isLoading
                  ? Array(5).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className="bg-[#4C4C4C] h-72 min-w-[180px] max-w-[200px] animate-pulse rounded-xl border border-white"
                      />
                    ))
                  : popularProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
              </div>
            </div>
          </section>

          <p className="ml-[100px] text-4xl mb-6">All Products</p>

          <div className="grid grid-cols-12 gap-6">
            {/* Filters */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-[#2B2B2B] p-6 rounded-3xl border border-gray-800 ml-20 w-[230px]">
                <h3 className="text-2xl font-normal mb-6">Sort / Filters:</h3>
                <div className="space-y-2">
                  <FilterDropdown title="All Brands" filterKey="brand" options={["Sony", "Canon", "Nikon", "Apple", "abc"]} />
                  <FilterDropdown title="Category" filterKey="category" options={categories} />
                  <FilterDropdown title="Color" filterKey="color" options={["Black", "White", "Silver", "Gold", "Blue"]} />
                  <FilterDropdown title="Type" filterKey="type" options={["Camera", "Lens", "Accessory", "Drone", "Audio"]} />
                  <FilterDropdown title="Price" filterKey="price" options={["Under 10k", "10k-50k", "50k-100k", "Above 100k"]} />
                </div>
              </div>
            </div>

            {/* Search + Products */}
            <div className="col-span-12 lg:col-span-9">
              <div className="bg-[#2B2B2B] p-6 rounded-xl border border-gray-800 ml-[-30px] mr-20">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-[#4C4C4C] border text-white px-6 py-3 rounded-l-full placeholder-gray-400 focus:outline-none"
                  />
                  <button type="submit" className="bg-white text-black px-6 py-3 rounded-r-full hover:bg-gray-200">
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
                        setFilters({ brand: "all", category: "all", color: "all", type: "all", price: "all" })
                        setSearchQuery("")
                      }}
                     className="bg-[#2C2C2C] hover:bg-[#3a3a3a] text-white px-6 py-3 rounded-lg border border-white transition-colors duration-300"

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
