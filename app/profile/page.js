import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Share2, Edit } from "lucide-react"

export default function ProfilePage() {
  // Sample user data
  const user = {
    name: "Shivam Mehta",
    title: "Creative UI/UX Designer Crafting Engaging Experience",
    languages: ["English", "Hindi", "Punjabi", "Russian"],
    followers: "97.3k",
    social: {
      instagram: "@DownDating",
      website: "downdating.com",
      instagramShow: "@downdating.show",
    },
    bio: "Pizza ipsum dolor meat lovers buffalo. Buffalo buffalo peppers pie black anchovies Hawaiian. Red spinach large bacon crust string ham melted. Pan wing mozzarella pesto garlic platter. Onions hand melted garlic spinach red melted cheese green. Fresh string pan bell pork ipsum and. Sautéed bbq beef cheese buffalo lovers pineapple fresh pizza sautéed stuffed pizza. White black chicken mouth black mayo meat peppers personal Chicago. NY rib bbq spinach mozzarella. String sausage mozzarella chicken ranch Aussie party. Party ranch spinach anchovies meatball sausage sautéed tomato personal NY. Style crust chicken crust Aussie. Banana tossed pepperoni sautéed NY pesto fresh mouth steak. Tomatoes large ipsum roll Chicago lot anchovies meat roll. Banana personal Aussie meat and large pie meatball sausage. And lot meat peppers banana cheese white bacon deep green. White pizza large Chicago sautéed bell white. String cheese lasagna style Chicago tomato sausage. Melted style string green large tomato Philly peppers platter.",
    accountInfo: {
      id: "5459e438-5061",
      email: "shivdude@gmail.com",
      name: "Shivam Mehta",
      phone: "+919213956392",
      instagram: "@downdating.show",
      role: "CREATOR",
      status: "ACTIVE",
      joined: "5/9/2025",
    },
  }

  // Sample product collaborations
  const collaborations = [
    {
      id: 1,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
      bgColor: "bg-yellow-400",
    },
    {
      id: 2,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
      bgColor: "bg-gray-800",
    },
    {
      id: 3,
      name: "Product Name",
      company: "Company Name",
      price: "Rs. 300",
      image: "/placeholder.svg?height=300&width=300",
      bgColor: "bg-gray-800",
    },
  ]

  return (
    <div className="bg-[#111] rounded-3xl mt-6 overflow-hidden">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Image and Info */}
          <div>
            <div className="relative w-full max-w-[300px] aspect-square mb-4">
              <Image
                src="/placeholder.svg?height=400&width=400"
                alt={user.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-4xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-300">{user.title}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" className="rounded-full bg-white">
                  <Share2 className="h-5 w-5 text-black" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full bg-white">
                  <Edit className="h-5 w-5 text-black" />
                </Button>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div className="bg-[#222] rounded-md px-3 py-1 flex items-center">
                <span className="text-white mr-2">Speaks:</span>
                <span className="text-gray-300">{user.languages.join(" | ")}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-3xl font-bold text-yellow-400 mb-4">{user.followers} Followers</h3>
              <div className="flex flex-wrap gap-2">
                <div className="bg-[#222] rounded-full px-4 py-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="text-white">{user.social.instagram}</span>
                </div>
                <div className="bg-[#222] rounded-full px-4 py-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.033 16.01c.564-1.789 1.632-3.932 1.821-4.474.273-.787-.211-1.136-1.74.209l-.34-.64c1.744-1.897 5.335-2.326 4.113.613-.763 1.835-1.309 3.074-1.621 4.03-.455 1.393.694.828 1.819-.211.153.25.203.331.356.619-2.498 2.378-5.271 2.588-4.408-.146zm4.742-8.169c-.532.453-1.32.443-1.761-.022-.441-.465-.43-1.195.1-1.647.532-.453 1.32-.442 1.761.022.439.466.429 1.196-.1 1.647z" />
                  </svg>
                  <span className="text-white">{user.social.website}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 my-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Me Section */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">About me</h3>
            <p className="text-gray-300 text-sm">{user.bio}</p>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">User ID (UID)</p>
                <p className="text-white">{user.accountInfo.id}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white">{user.accountInfo.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Name</p>
                <p className="text-white">{user.accountInfo.name}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone Number</p>
                <p className="text-white">{user.accountInfo.phone}</p>
              </div>
              <div>
                <p className="text-gray-400">Instagram Handle</p>
                <p className="text-white">{user.accountInfo.instagram}</p>
              </div>
              <div>
                <p className="text-gray-400">Role</p>
                <p className="text-yellow-400 font-bold">{user.accountInfo.role}</p>
              </div>
              <div>
                <p className="text-gray-400">Account Status</p>
                <p className="text-green-400 font-bold">{user.accountInfo.status}</p>
              </div>
              <div>
                <p className="text-gray-400">Joined</p>
                <p className="text-white">{user.accountInfo.joined}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 my-8"></div>

        {/* Product Collaborations */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Product Collaborations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {collaborations.map((product) => (
              <div key={product.id} className={`rounded-xl overflow-hidden ${product.bgColor}`}>
                <div className="relative aspect-square">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="bg-[#111] p-4">
                  <h4 className="text-white font-bold">{product.name}</h4>
                  <p className="text-gray-400 text-sm">By {product.company}</p>
                  <p className="text-green-400 font-bold mt-2">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
