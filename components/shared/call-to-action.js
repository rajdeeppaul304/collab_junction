import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CallToAction({ title, description, buttonText, buttonLink }) {
  return (
    <section className="bg-orange-500 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">{description}</p>
        <Button asChild size="lg" className="bg-white text-orange-500 hover:bg-gray-100">
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </div>
    </section>
  )
}
