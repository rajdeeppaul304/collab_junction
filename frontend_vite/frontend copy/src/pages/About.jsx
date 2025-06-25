import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"

const About = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 sm:py-8 bg-[#171717]">
        {/* Hero Section */}
        <section className="relative rounded-lg overflow-hidden -mt-2 sm:-mt-[10px] mx-2 sm:mx-[25px] mb-8 sm:mb-[40px]">
          <img
            src="/Section 1.png"
            alt="Collab Junction Hero"
            className="w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[500px] 2xl:h-[792px] object-cover object-center rounded-lg"
          />
        </section>

        {/* Vision Section */}
        <section className="mb-12 sm:mb-20">
          <div className="border border-yellow-300 bg-black rounded-3xl sm:rounded-[50px] min-h-[200px] sm:h-auto p-6 sm:p-8 w-full max-w-[1450px] mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-yellow-300">
              Our Vision
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed sm:leading-snug max-w-7xl mx-auto px-2 sm:px-6 text-white">
              We believe the future of marketing lies in genuine connection and trust. By leveraging AI to facilitate
              authentic collaborations at scale, Collab Junction aims to create a thriving ecosystem where both brands
              and creators achieve meaningful growth.
            </p>
          </div>
        </section>

        {/* AI Benefits Section */}
        <section className="mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-center text-white">
            The Power of AI on Branding
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: "💡",
                title: "Smart Matching",
                description:
                  "Our AI analyzes creator profiles and brand requirements to create perfect matches based on audience demographics, engagement rates, and content style.",
              },
              {
                icon: "🔍",
                title: "Audience Insights",
                description:
                  "Get deep insights into creator audiences to ensure your products reach the right demographic with the highest potential for conversion.",
              },
              {
                icon: "🤝",
                title: "Automated Workflows",
                description:
                  "Streamline collaboration processes from initial outreach to final content approval with our AI-powered workflow automation.",
              },
              {
                icon: "📊",
                title: "Performance Analytics",
                description:
                  "Track campaign performance with detailed analytics on engagement, reach, and conversion metrics to optimize your influencer strategy.",
              },
            ].map((item, i) => (
              <Card key={i} border>
                <div className="flex flex-col items-center text-center p-4 sm:p-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-800 flex items-center justify-center mb-3 sm:mb-4">
                    <span className="text-yellow-400 text-xl sm:text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">{item.title}</h3>
                  <p className="text-white text-xs sm:text-sm leading-relaxed">{item.description}</p>
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
