"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import CreatorAPI from "../creatorApi" // <-- Adjust the path as necessary

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
       const [productsRes, categoriesRes] = await Promise.all([
          CreatorAPI.get("/products", {
            params: {
              category: selectedCategory !== "all" ? selectedCategory : undefined,
              search: searchQuery || undefined,
            },
          }),
          CreatorAPI.get("/products/categories"),
        ])


        setProducts(productsRes.data)
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedCategory, searchQuery])

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is already triggered by the useEffect dependency
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>

        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">
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

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-md ${
              selectedCategory === "all" ? "bg-yellow-400 text-black" : "bg-gray-800 text-white"
            }`}
            onClick={() => handleCategoryChange("all")}
          >
            All Categories
          </button>

          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-md ${
                selectedCategory === category ? "bg-yellow-400 text-black" : "bg-gray-800 text-white"
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No products found matching your criteria.</p>
            <Button
              onClick={() => {
                setSelectedCategory("all")
                setSearchQuery("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-bold hover:text-yellow-400">{product.name}</h3>
                  </Link>
                  <p className="text-gray-400 text-sm">By {product.brand}</p>
                  <p className="text-yellow-400 my-1">Rs. {product.price}</p>
                  <Button variant="outline" size="sm" fullWidth>
                    I'm interested
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Products
