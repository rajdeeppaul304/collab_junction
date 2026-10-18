import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"

const About = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 sm:py-8 bg-[#171717]">
        {/* Hero Section */}
        <section className="mx-4 md:mx-8 xl:mx-10">
          <div className="relative min-h-screen flex items-center justify-center overflow-hidden rounded-lg">
            {/* Background Images Split */}
            <div className="absolute inset-0 flex">
              <div className="w-1/2 h-full">
                <img
                  src="/Rectangle 2.png"
                  alt="Team collaboration left"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-1/2 h-full">
                <img
                  src="/Rectangle 3.png"
                  alt="Team collaboration right"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
              <h1 className="text-2xl md:text-4xl lg:text-6xl text-white leading-tight mb-8 sm:mb-12">
                About <span className="text-yellow-300">Collab Junction</span>: AI-Powered Authentic{' '}
                <span className="text-yellow-300">Branding</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8">
                We're revolutionizing how brands connect with audiences. Collab Junction leverages AI to
                match brands with relevant micro-influencers, automating collaborations to generate
                authentic social proof and massive reach at scale.
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300">
                Our mission is to move beyond traditional advertising by fostering genuine partnerships that result in
                content people trust, driving real brand growth and enabling creators to thrive by sharing products
                they love.
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-12 sm:mb-20 mt-10">
          <div className="border border-yellow-300 bg-black rounded-3xl sm:rounded-[50px] p-6 sm:p-8 max-w-[1450px] mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-300 mb-4 sm:mb-7">
              Our Vision
            </h2>
            <p className="mt-6 sm:mt-8 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white leading-relaxed sm:leading-snug max-w-7xl mx-auto">
              We believe the future of marketing lies in genuine connection and trust. By leveraging AI to facilitate
              authentic collaborations at scale, Collab Junction aims to create a thriving ecosystem where both brands
              and creators achieve meaningful growth.
            </p>
          </div>
        </section>

        {/* AI Benefits Section */}
        <section className="mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 sm:mb-12 text-center text-white">
            The Power of AI on Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full max-w-[1200px] mx-auto">
            {[
              {
                icon: "7.png",
                title: "Smart Matching",
                description:
                  "Our AI analyzes creator profiles and brand needs to create perfect matches based on demographics, engagement, and content style.",
              },
              {
                icon: "6.png",
                title: "Audience Insight",
                description:
                  "Get deep insights into creator audiences to ensure your message hits the right demographic with high conversion potential.",
              },
              {
                icon: "5.png",
                title: "Automation",
                description:
                  "Automate every step — from outreach to approval — using our AI workflow, saving time and scaling collaborations.",
              },
              {
                icon: "4.png",
                title: "Performance Tracking",
                description:
                  "Track your campaign’s performance in real-time — engagement, reach, conversions — and optimize intelligently.",
              },
            ].map((item, index) => (
              <Card key={index} border>
                <div className="flex flex-col items-center text-center p-4 sm:p-6">
                  <div className="w-12 h-12 sm:w-[45px] sm:h-[40px] flex items-center justify-center mb-3 sm:mb-4">
                    <img
                      src={`/${item.icon}`}
                      alt={item.title}
                      className="w-6 h-6 sm:w-[60px] sm:h-[60px] object-contain"
                    />
                  </div>
                  <h3 className="text-lg sm:text-[21px] font-semibold text-white mt-4 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white text-xs sm:text-[12px] leading-relaxed mt-4 text-left font-semibold">
                    {item.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default About
