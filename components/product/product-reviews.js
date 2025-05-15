import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function ProductReviews({ productId }) {
  // Sample reviews
  const reviews = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      rating: 5,
      date: "May 10, 2023",
      title: "Exceeded my expectations!",
      content:
        "The design package was exactly what my business needed. The team was responsive and delivered high-quality work ahead of schedule. I'm extremely satisfied with the results and have already received compliments on my new branding.",
    },
    {
      id: 2,
      user: {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      rating: 4,
      date: "April 28, 2023",
      title: "Great value for the price",
      content:
        "I'm very happy with the design package. The logo and brand materials look professional and cohesive. The only reason I'm giving 4 stars instead of 5 is that I would have liked a few more revision options, but overall it was a great experience.",
    },
    {
      id: 3,
      user: {
        name: "Jessica Williams",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      rating: 5,
      date: "March 15, 2023",
      title: "Transformed my brand identity",
      content:
        "Working with this design team was a game-changer for my small business. They took the time to understand my vision and translated it into a beautiful, cohesive brand identity. The social media templates have made it so much easier to maintain a professional presence online.",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        <span className="text-sm text-gray-500">{reviews.length} reviews</span>
      </div>

      {reviews.map((review, index) => (
        <div key={review.id}>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                  <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{review.user.name}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold">{review.title}</h4>
              <p className="text-gray-700 mt-1">{review.content}</p>
            </div>
          </div>

          {index < reviews.length - 1 && <Separator className="my-6" />}
        </div>
      ))}
    </div>
  )
}
