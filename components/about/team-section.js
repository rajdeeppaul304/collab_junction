import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Linkedin, Twitter, Mail } from "lucide-react"

export default function TeamSection() {
  const team = [
    {
      name: "Emma Rodriguez",
      role: "Founder & CEO",
      bio: "Emma has over 15 years of experience in creative industries and is passionate about connecting talent.",
      avatar: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "emma@example.com",
      },
    },
    {
      name: "David Chen",
      role: "CTO",
      bio: "David brings technical expertise and a vision for how technology can empower creative collaboration.",
      avatar: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "david@example.com",
      },
    },
    {
      name: "Sophia Kim",
      role: "Head of Community",
      bio: "Sophia is dedicated to nurturing our community and ensuring a positive experience for all members.",
      avatar: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "sophia@example.com",
      },
    },
    {
      name: "Marcus Johnson",
      role: "Creative Director",
      bio: "Marcus oversees the creative direction of the platform and brings a wealth of design experience.",
      avatar: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "marcus@example.com",
      },
    },
  ]

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Meet Our Team</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {team.map((member, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-square relative">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} className="object-cover" />
                <AvatarFallback className="text-4xl rounded-none h-full w-full">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <CardContent className="pt-4">
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-orange-500 text-sm mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
              <div className="flex space-x-3">
                <a href={member.social.linkedin} className="text-gray-500 hover:text-orange-500">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href={member.social.twitter} className="text-gray-500 hover:text-orange-500">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href={`mailto:${member.social.email}`} className="text-gray-500 hover:text-orange-500">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
