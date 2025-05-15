import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function StorePage() {
  // Sample products
  const popularProducts = [
    {
      id: 1,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 2,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 3,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 4,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 5,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  const allProducts = [
    {
      id: 6,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 7,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 8,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 9,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 10,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 11,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 12,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 13,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  // Filter categories
  const filterCategories = [
    { name: "All brands", expanded: false },
    { name: "All Category", expanded: false },
    { name: "All Colours", expanded: false },
    { name: "All Types", expanded: false },
    { name: "All Prizes", expanded: false },
  ]

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-white mb-8">Product Catalog</h1>

      {/* Popular Products */}
      <div className="bg-[#111] rounded-3xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Popular Product</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {popularProducts.map((product) => (
            <div key={product.id} className="bg-black rounded-xl overflow-hidden">
              <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="text-white font-medium text-sm">{product.name}</h3>
                  <p className="text-gray-400 text-xs">by {product.company}</p>
                  <p className="text-green-400 text-sm font-medium mt-1">{product.price}</p>
                  <Button variant="outline" className="w-full mt-2 text-xs h-8 bg-white text-black hover:bg-gray-200">
                    I&apos;m interested
                  </Button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* All Products */}
      <h2 className="text-3xl font-bold text-white mb-4">All Product</h2>

      <div className="bg-[#111] rounded-3xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters */}
          <div className="w-full md:w-64 bg-[#222] rounded-xl p-4">
            <h3 className="text-white font-bold mb-4">Sort / Filters:</h3>
            <div className="space-y-2">
              {filterCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between bg-[#333] rounded-lg p-3 cursor-pointer">
                  <span className="text-white text-sm">{category.name}</span>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center mb-6 bg-[#222] rounded-full overflow-hidden">
              <Input
                placeholder="Search products..."
                className="border-0 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button size="icon" className="rounded-full bg-white h-8 w-8 mr-1">
                <Search className="h-4 w-4 text-black" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allProducts.map((product) => (
                <div key={product.id} className="bg-black rounded-xl overflow-hidden">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative aspect-square">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-white font-medium text-sm">{product.name}</h3>
                      <p className="text-gray-400 text-xs">by {product.company}</p>
                      <p className="text-green-400 text-sm font-medium mt-1">{product.price}</p>
                      <Button
                        variant="outline"
                        className="w-full mt-2 text-xs h-8 bg-white text-black hover:bg-gray-200"
                      >
                        I&apos;m interested
                      </Button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
