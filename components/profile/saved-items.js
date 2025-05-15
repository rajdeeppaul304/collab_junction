import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Trash2 } from "lucide-react"

export default function SavedItems() {
  // Sample saved items
  const savedItems = [
    {
      id: 5,
      name: "Web Development Package",
      price: 299.99,
      category: "Development",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 6,
      name: "Logo Design Service",
      price: 149.99,
      category: "Design",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 7,
      name: "SEO Optimization",
      price: 129.99,
      category: "Marketing",
      image: "/placeholder.svg?height=400&width=400",
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Saved Items</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedItems.map((item) => (
          <Card key={item.id} className="h-full">
            <div className="relative aspect-square">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="pt-4">
              <Link href={`/product/${item.id}`}>
                <h3 className="font-semibold text-lg hover:text-orange-500">{item.name}</h3>
              </Link>
              <p className="text-sm text-gray-500">{item.category}</p>
              <p className="font-bold text-lg mt-2">${item.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
