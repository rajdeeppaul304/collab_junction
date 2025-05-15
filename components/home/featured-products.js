import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

export default function FeaturedProducts() {
  // Sample product data
  const products = [
    {
      id: 1,
      name: "Creative Design Package",
      price: 99.99,
      category: "Design",
      image: "/placeholder.svg?height=400&width=400",
      featured: true,
    },
    {
      id: 2,
      name: "Content Creation Bundle",
      price: 149.99,
      category: "Content",
      image: "/placeholder.svg?height=400&width=400",
      featured: true,
    },
    {
      id: 3,
      name: "Marketing Strategy Session",
      price: 199.99,
      category: "Marketing",
      image: "/placeholder.svg?height=400&width=400",
      featured: true,
    },
    {
      id: 4,
      name: "Social Media Management",
      price: 79.99,
      category: "Social",
      image: "/placeholder.svg?height=400&width=400",
      featured: true,
    },
  ]

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
        <Link href="/store" className="text-orange-500 hover:text-orange-600 font-medium">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <Card className="h-full transition-all hover:shadow-md">
              <div className="relative aspect-square">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
                {product.featured && <Badge className="absolute top-2 right-2 bg-orange-500">Featured</Badge>}
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
