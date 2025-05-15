import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"

export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>
            <CardContent className="pt-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{product.category}</p>

              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews})
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
