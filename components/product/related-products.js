import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function RelatedProducts({ currentProductId }) {
  // Sample related products
  const relatedProducts = [
    {
      id: 101,
      name: "Brand Identity Package",
      price: 149.99,
      category: "Design",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 102,
      name: "Social Media Kit",
      price: 79.99,
      category: "Design",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 103,
      name: "Website Design Package",
      price: 299.99,
      category: "Design",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 104,
      name: "Marketing Materials Bundle",
      price: 129.99,
      category: "Design",
      image: "/placeholder.svg?height=400&width=400",
    },
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <Card className="h-full transition-all hover:shadow-md">
              <div className="relative aspect-square">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
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
