"use client"
import { Users } from "lucide-react"

const creators = [
  {
    id: 1,
    name: "Emma Rott",
    specialty: "Fashion & Lifestyle",
    followers: "28k",
    image: "/placeholder.svg?height=400&width=300",
    bgColor: "from-red-500 to-pink-500",
  },
  {
    id: 2,
    name: "Priter Pete",
    specialty: "Travel Photography",
    followers: "20k",
    image: "/placeholder.svg?height=400&width=300",
    bgColor: "from-gray-600 to-gray-800",
  },
  {
    id: 3,
    name: "Radaan Maini",
    specialty: "Healthy Lifestyle",
    followers: "25k",
    image: "/placeholder.svg?height=400&width=300",
    bgColor: "from-blue-500 to-indigo-600",
  },
  {
    id: 4,
    name: "Ralana Knight",
    specialty: "Cosmetics Enthusiast",
    followers: "37k",
    image: "/placeholder.svg?height=400&width=300",
    bgColor: "from-purple-500 to-pink-600",
  },
  {
    id: 5,
    name: "Rani Vankova",
    specialty: "Travel Vlogging",
    followers: "31k",
    image: "/placeholder.svg?height=400&width=300",
    bgColor: "from-pink-400 to-rose-500",
  },
  {
    id: 6,
    name: "Alex Chen",
    specialty: "Tech Reviews",
    followers: "45k",
    image: "/placeholder.svg?height=400&width=300",
    bgColor: "from-green-500 to-teal-600",
  },
]

export default function CreatorSpotlight() {
  // Duplicate creators multiple times for seamless infinite scroll
  const infiniteCreators = [...creators, ...creators]

  return (
    <div className="w-[1465px] min-h-screen bg-[#171717] py-12 rounded-3xl shadow-lg ml-5">
      <div className="max-w-[f] mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-[64px] font-bold text-white mb-4">Creator Spotlight</h1>
        </div>

        <div className="overflow-hidden">
          <div className="flex animate-scroll">
            {infiniteCreators.map((creator, index) => (
              <div key={`${creator.id}-${index}`} className="flex-shrink-0 mr-8">
                <CreatorCard creator={creator} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CreatorCard({ creator }) {
  return (
    <div className="relative group cursor-pointer">
      <div
        className={`relative h-[500px] w-[350px] rounded-2xl overflow-hidden  transform transition-all duration-300 group-hover:scale-105`}
      >
        {/* Network Icon */}
        <div className="absolute top-4 left-4 z-10">
          <div className="w-10 h-10  rounded-full flex items-center justify-center shadow-md">
            <img src="/public/Group 15.png" className="w-14 h-10 text-gray-800" />
          </div>
        </div>

        {/* Profile Image */}
        <div className="absolute inset-0 bg-black bg-opacity-20">
          <img
            src={creator.image || "/placeholder.svg"}
            alt={creator.name}
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-xl font-bold mb-1">{creator.name}</h3>
            <p className="text-gray-200 text-sm mb-2 opacity-90">{creator.specialty}</p>
            <div className="flex items-center">
              <span className="text-yellow-300 font-bold text-base">{creator.followers} Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

