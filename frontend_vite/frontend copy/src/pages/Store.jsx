"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import CreatorAPI from "../creatorApi"
import getImageUrl from "../utils/getImageUrl"

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

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CreatorAPI.get("/products/categories")
        setCategories(response.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Build query parameters
        const params = {}
        if (searchQuery.trim()) params.search = searchQuery.trim()
        if (filters.category !== "all") params.category = filters.category

        const [productsRes, popularRes] = await Promise.all([
          CreatorAPI.get("/products", { params }),
          CreatorAPI.get("/products/popular"),
        ])

        setProducts(productsRes.data)
        setPopularProducts(popularRes.data)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to load products. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [filters, searchQuery])

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is already triggered by the useEffect dependency
  }

  const ProductCard = ({ product }) => (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <Link to={`/product/${product.id}`}>
        <div className="h-48 overflow-hidden">
          <img
            // src={product.image || "/placeholder.svg"}
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              e.target.src = "/placeholder.svg"
            }}
          />
        </div>
      </Link>
      <div className="p-3">
        <h3 className="text-white font-medium">{product.name}</h3>
        <p className="text-gray-400 text-sm">By {product.brand}</p>
        <p className="text-yellow-400 my-1">Rs. {product.price?.toLocaleString()}</p>
        {/* <Button variant="outline" size="sm" fullWidth>
          I'm interested
        </Button> */}
      </div>
    </div>
  )

  const FilterDropdown = ({ title, filterKey, options, currentValue }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="relative">
        <h4 className="font-medium mb-2">{title}</h4>
        <button
          className="flex items-center justify-between w-full p-2 bg-gray-800 rounded-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{currentValue === "all" ? title : currentValue}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
            <button
              className="w-full text-left p-2 hover:bg-gray-700 rounded-t-md"
              onClick={() => {
                handleFilterChange(filterKey, "all")
                setIsOpen(false)
              }}
            >
              All {title.split(' ')[1] || title}
            </button>
            {options.map((option) => (
              <button
                key={option}
                className="w-full text-left p-2 hover:bg-gray-700 last:rounded-b-md"
                onClick={() => {
                  handleFilterChange(filterKey, option)
                  setIsOpen(false)
                }}
              >
                {option}
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Product Catalog</h1>

        {/* Popular Products Section */}
        <section className="mb-12">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Popular Products</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, index) => <div key={index} className="bg-gray-800 rounded-lg h-64 animate-pulse"></div>)
                : popularProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </Card>
        </section>

        {/* All Products Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">All Products</h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <h3 className="text-lg font-bold mb-4">Sort / Filters:</h3>

                <div className="space-y-4">
                  <FilterDropdown
                    title="All Brands"
                    filterKey="brand"
                    options={["Sony", "Canon", "Nikon", "Apple", "abc"]} // You can make this dynamic
                    currentValue={filters.brand}
                  />

                  <FilterDropdown
                    title="All Categories"
                    filterKey="category"
                    options={categories}
                    currentValue={filters.category}
                  />

                  <FilterDropdown
                    title="All Colors"
                    filterKey="color"
                    options={["Black", "White", "Silver", "Gold", "Blue"]} // You can make this dynamic
                    currentValue={filters.color}
                  />

                  <FilterDropdown
                    title="All Types"
                    filterKey="type"
                    options={["Camera", "Lens", "Accessory", "Drone", "Audio"]} // You can make this dynamic
                    currentValue={filters.type}
                  />

                  <FilterDropdown
                    title="All Prices"
                    filterKey="price"
                    options={["Under 10k", "10k-50k", "50k-100k", "Above 100k"]}
                    currentValue={filters.price}
                  />
                </div>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  fullWidth
                  className="mt-4"
                  onClick={() => {
                    setFilters({
                      brand: "all",
                      category: "all",
                      color: "all",
                      type: "all",
                      price: "all",
                    })
                    setSearchQuery("")
                  }}
                >
                  Clear All Filters
                </Button>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <form onSubmit={handleSearch} className="flex">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="submit" className="ml-2">
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
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </Button>
                </form>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Array(12)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg h-64 animate-pulse"></div>
                    ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No products found matching your criteria.</p>
                  <Button
                    onClick={() => {
                      setFilters({
                        brand: "all",
                        category: "all",
                        color: "all",
                        type: "all",
                        price: "all",
                      })
                      setSearchQuery("")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default Store