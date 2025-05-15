import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Hero() {
  return (
    <div className="relative">
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-6 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            Collaborate with <span className="text-orange-500">creators</span> worldwide
          </h1>
          <p className="text-lg text-gray-600 max-w-md">
            Connect, create, and collaborate with talented individuals from around the globe on Collab Junction.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/store">Explore Store</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 relative">
          <div className="aspect-video relative rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/placeholder.svg?height=600&width=800"
              alt="Collaboration"
              width={800}
              height={600}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
