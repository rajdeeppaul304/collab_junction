import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Edit } from "lucide-react"

export default function ProfileInfo() {
  // Sample user data
  const user = {
    name: "Alex Johnson",
    username: "alexj",
    avatar: "/placeholder.svg?height=300&width=300",
    bio: "Digital creator specializing in graphic design and brand identity. Looking for collaboration opportunities.",
    memberSince: "January 2023",
    rating: 4.9,
    reviews: 27,
    badges: ["Verified Creator", "Top Seller"],
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-500 text-sm">@{user.username}</p>

          <div className="flex items-center mt-2">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(user.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {user.rating} ({user.reviews})
            </span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {user.badges.map((badge, index) => (
              <Badge key={index} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-700 mb-6">
          <p>{user.bio}</p>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          <p>Member since {user.memberSince}</p>
        </div>

        <Button className="w-full" variant="outline">
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </CardContent>
    </Card>
  )
}
