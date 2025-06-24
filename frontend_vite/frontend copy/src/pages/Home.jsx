import { Link } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

const Home = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative rounded-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-black to-gray-900 p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Easy Way to <span className="text-yellow-400">collaborate</span> with <br />
                <span className="text-yellow-400">brands</span> and grow as a{" "}
                <span className="text-yellow-400">creator</span>
              </h1>
              <p className="text-gray-300 mb-8">
                Connect with brands that align with your values, showcase your talent, and earn through authentic
                collaborations.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/signup">
                  <Button variant="outline">I'm a Creator</Button>
                </Link>
                <Link to="/signup">
                  <Button>I'm a Brand</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Creator Benefits Section */}
        <section className="mb-12 grid md:grid-cols-2 gap-6">
          <div className="rounded-lg overflow-hidden">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Home%20Page.png-GhRjf3RFbezi5v7beGepUgQEsivdJ2.jpeg"
              alt="Creator"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <h2 className="text-2xl font-bold text-yellow-400">Creator</h2>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">What do we offer?</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center mb-3">
                    <span className="text-black text-xl">$</span>
                  </div>
                  <h3 className="font-bold mb-2">Benefit</h3>
                  <p className="text-sm text-gray-400">
                    Monetize your influence and earn through authentic product promotions.
                  </p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center mb-3">
                    <span className="text-black text-xl">★</span>
                  </div>
                  <h3 className="font-bold mb-2">Benefit</h3>
                  <p className="text-sm text-gray-400">
                    Access exclusive products and collaborate with premium brands.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Brand Benefits Section */}
        <section className="mb-12 grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-6">What do we offer?</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center mb-3">
                    <span className="text-black text-xl">📈</span>
                  </div>
                  <h3 className="font-bold mb-2">Benefit</h3>
                  <p className="text-sm text-gray-400">
                    Connect with relevant micro-influencers to boost your brand visibility.
                  </p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center mb-3">
                    <span className="text-black text-xl">🔍</span>
                  </div>
                  <h3 className="font-bold mb-2">Benefit</h3>
                  <p className="text-sm text-gray-400">
                    AI-powered matching to find the perfect creators for your brand.
                  </p>
                </div>
              </Card>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Home%20Page.png-GhRjf3RFbezi5v7beGepUgQEsivdJ2.jpeg"
              alt="Brand"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4">
              <h2 className="text-2xl font-bold text-yellow-400">Brand</h2>
            </div>
          </div>
        </section>

        {/* Brand Collaborations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Brand Collaborations</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["Starbucks", "Jack Daniels", "Coca Cola", "Nike", "Red Bull"].map((brand) => (
              <div key={brand} className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xs">{brand}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Creator Spotlight */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Creator Spotlight</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "Creator 1", followers: "15K" },
              { name: "Creator 2", followers: "20K" },
              { name: "Creator 3", followers: "25K" },
              { name: "Creator 4", followers: "37K" },
              { name: "Creator 5", followers: "31K" },
            ].map((creator, index) => (
              <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-800"></div>
                <div className="p-2 text-center">
                  <h3 className="font-medium">{creator.name}</h3>
                  <p className="text-yellow-400 text-sm">{creator.followers} Followers</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Want your brand deals to sky rocket?</h2>
          <h3 className="text-3xl font-bold text-yellow-400 mb-8">Join Us!</h3>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10 text-yellow-400"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">For Creators</h3>
              <p className="text-gray-400 mb-4">
                Join our platform to connect with brands, receive product offers, and monetize your influence.
              </p>
              <Link to="/signup">
                <Button variant="outline">I'm a Creator</Button>
              </Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10 text-yellow-400"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">For Brands</h3>
              <p className="text-gray-400 mb-4">
                List your products and connect with relevant creators to boost your brand visibility.
              </p>
              <Link to="/signup">
                <Button>I'm a Brand</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default Home
