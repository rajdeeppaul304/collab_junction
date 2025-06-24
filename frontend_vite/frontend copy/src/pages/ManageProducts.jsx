"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import BrandAPI from "../brandApi"
import getImageUrl from "../utils/getImageUrl"

const ManageProducts = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(10)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await BrandAPI.get("/products")
        setProducts(response.data)
        setFilteredProducts(response.data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    // Filter products based on search query and status
    let filtered = products

    if (searchQuery) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((product) => product.status === selectedStatus)
    }

    setFilteredProducts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, selectedStatus, products])

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleStatusFilter = (status) => {
    setSelectedStatus(status)
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await BrandAPI.delete(`/products/${productId}`)
        setProducts(products.filter((product) => product.id !== productId))
        alert("Product deleted successfully")
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Failed to delete product")
      }
    }
  }

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"

    try {
      await BrandAPI.patch(`/products/${productId}/status`, { status: newStatus })

      setProducts(products.map((product) => (product.id === productId ? { ...product, status: newStatus } : product)))
    } catch (error) {
      console.error("Error updating product status:", error)
      alert("Failed to update product status")
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Manage Products</h1>
          <Link to="/add-product">
            <Button>Add New Product</Button>
          </Link>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow">
              <Input placeholder="Search products..." value={searchQuery} onChange={handleSearch} className="w-full" />
            </div>

            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-md ${
                  selectedStatus === "all" ? "bg-yellow-400 text-black" : "bg-gray-800 text-white"
                }`}
                onClick={() => handleStatusFilter("all")}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  selectedStatus === "active" ? "bg-yellow-400 text-black" : "bg-gray-800 text-white"
                }`}
                onClick={() => handleStatusFilter("active")}
              >
                Active
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  selectedStatus === "inactive" ? "bg-yellow-400 text-black" : "bg-gray-800 text-white"
                }`}
                onClick={() => handleStatusFilter("inactive")}
              >
                Inactive
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No products found.</p>
              <Link to="/add-product">
                <Button>Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2">Image</th>
                      <th className="text-left py-3 px-2">Name</th>
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-left py-3 px-2">Price</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Interest</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product) => (
                      console.log(product),
                      <tr key={product.id} className="border-b border-gray-800">
                        <td className="py-3 px-2">
                          <div className="w-12 h-12 bg-gray-800 rounded-md overflow-hidden">
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2">{product.name}</td>
                        <td className="py-3 px-2">{product.category}</td>
                        <td className="py-3 px-2">₹{product.price}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.status === "active"
                                ? "bg-green-400/20 text-green-400"
                                : "bg-gray-400/20 text-gray-400"
                            }`}
                          >
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-2">{product.interestCount || 0}</td>
                        <td className="py-3 px-2">
                          <div className="flex space-x-2">
                            <Link to={`/product/${product.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Link to={`/products/${product.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant={product.status === "active" ? "outline" : "secondary"}
                              size="sm"
                              onClick={() => handleToggleStatus(product.id, product.status)}
                            >
                              {product.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:bg-red-500/10"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-1">
                    <button
                      className="px-3 py-1 rounded-md bg-gray-800 text-white disabled:opacity-50"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === page ? "bg-yellow-400 text-black" : "bg-gray-800 text-white"
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="px-3 py-1 rounded-md bg-gray-800 text-white disabled:opacity-50"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Product Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="mr-4 text-2xl">📦</div>
              <div>
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="mr-4 text-2xl">✅</div>
              <div>
                <p className="text-gray-400 text-sm">Active Products</p>
                <p className="text-2xl font-bold">{products.filter((p) => p.status === "active").length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="mr-4 text-2xl">👁️</div>
              <div>
                <p className="text-gray-400 text-sm">Total Interest</p>
                <p className="text-2xl font-bold">
                  {products.reduce((sum, product) => sum + (product.interestCount || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default ManageProducts
