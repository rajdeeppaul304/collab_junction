import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import CreatorAPI from "../creatorApi"
import getImageUrl from "../utils/getImageUrl"

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
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
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products. Please try again.")
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

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </MainLayout>
    )
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
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="h-full"
              >
                <Card className="overflow-hidden h-full flex flex-col justify-between border border-gray-800 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/5 transition-colors duration-300">
                  <div>
                    <Link to={`/product/${product.id}`}>
                      <div className="h-48 overflow-hidden">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-108"
                          onError={(e) => { e.target.src = "/placeholder.svg" }}
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-bold hover:text-yellow-400 line-clamp-1 transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-gray-400 text-sm">By {product.brand}</p>
                      <p className="text-yellow-400 font-semibold my-1">Rs. {product.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <Link to={`/product/${product.id}`}>
                      <Button variant="outline" size="sm" fullWidth>
                        View Product
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default Products
