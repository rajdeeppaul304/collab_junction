import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft } from "lucide-react"

export default function ProductPage({ params }) {
  // In a real app, you would fetch the product data based on params.id
  const product = {
    id: params.id,
    name: "Loose Red Hoodie",
    category: "T-shirts",
    price: "₹399",
    discountPrice: "Free",
    description:
      "Pizza ipsum dolor meat lovers buffalo. Dolor peppers meat ham thin and. Bianca party party bacon bacon mozzarella green pie tomato mayo. Melted ricotta mozzarella chicken extra dolor tomato pan and. Pesto beef personal Chicago parmesan banana wing. Banana bell Chicago wing pizza pesto extra wing mozzarella thin. Bacon black roll meatball tossed.",
    image: "/placeholder.svg?height=600&width=600",
    thumbnails: [
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
    ],
    sizes: ["S", "M", "L", "XL", "+2"],
    creator: "Nick",
    discount: {
      timeRemaining: "23:22:54",
    },
  }

  return (
    <div className="bg-[#111] rounded-3xl mt-6 overflow-hidden">
      <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6">
          <Link href="/store" className="text-white flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Store
          </Link>
          <span className="text-gray-500 mx-2">{"<"}</span>
          <Link href="/store?category=t-shirts" className="text-gray-400">
            {product.category}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div className="flex gap-2">
              {product.thumbnails.map((thumb, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border-2 border-red-500">
                  <Image
                    src={thumb || "/placeholder.svg"}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="bg-[#222] inline-block px-4 py-1 rounded-full text-white mb-4">Category</div>

            <h1 className="text-4xl font-bold text-white mb-1">{product.name}</h1>
            <p className="text-gray-300 mb-4">By {product.creator}</p>

            <div className="bg-[#222] inline-block px-4 py-2 rounded-full text-white mb-6">
              Order in {product.discount.timeRemaining} in order to get the discount
            </div>

            <div className="mb-6">
              <span className="text-gray-400 text-2xl line-through mr-3">{product.price}</span>
              <span className="text-green-500 text-3xl font-bold">{product.discountPrice}</span>
            </div>

            <div className="mb-6">
              <h3 className="text-white font-bold mb-2">Description:</h3>
              <p className="text-gray-300">{product.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size, index) => (
                  <Button
                    key={index}
                    variant={index === 1 ? "default" : "outline"}
                    className={`rounded-full w-16 ${index === 1 ? "bg-black text-white" : "bg-white text-black"}`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-white text-black hover:bg-gray-200 rounded-full">Contact the company</Button>
              <Button variant="outline" size="icon" className="rounded-full bg-white">
                <Heart className="h-5 w-5 text-black" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
