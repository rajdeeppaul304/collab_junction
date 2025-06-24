import MainLayout from "../components/layout/MainLayout"
import Card from "../components/ui/Card"

const About = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative rounded-lg overflow-hidden mb-12 bg-gradient-to-r from-gray-900 to-black">
          <div className="p-8 md:p-12">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                About <span className="text-yellow-400">Collab Junction</span>: AI-
                <br />
                Powered Authentic <span className="text-yellow-400">Branding</span>
              </h1>
              <p className="text-gray-300 mb-4 max-w-3xl mx-auto">
                We're revolutionizing how brands connect with audiences. Collab Junction leverages AI to match brands
                with relevant micro-influencers, automating collaborations to generate authentic social proof and
                massive reach at scale.
              </p>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Our mission is to move beyond traditional advertising by fostering genuine partnerships that result in
                content people trust, driving real brand growth and enabling creators to thrive by sharing products they
                love.
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-12">
          <div className="border border-yellow-400 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Our Vision</h2>
            <p className="text-center max-w-3xl mx-auto">
              We believe the future of marketing lies in genuine connection and trust. By leveraging AI to facilitate
              authentic collaborations at scale, Collab Junction aims to create a thriving ecosystem where both brands
              and creators achieve meaningful growth.
            </p>
          </div>
        </section>

        {/* AI Benefits Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">The power of AI on branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            ].map((benefit, index) => (
              <Card key={index} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <span className="text-yellow-400 text-2xl">{benefit.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Alex Johnson",
                role: "Founder & CEO",
                bio: "Former marketing executive with 10+ years experience in influencer marketing and brand partnerships.",
              },
              {
                name: "Sarah Chen",
                role: "CTO",
                bio: "AI specialist with background in machine learning and recommendation systems from Google.",
              },
              {
                name: "Miguel Rodriguez",
                role: "Head of Creator Relations",
                bio: "Former content creator with 1M+ followers, now helping creators navigate brand partnerships.",
              },
            ].map((member, index) => (
              <Card key={index} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-800 mb-4"></div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-yellow-400 mb-2">{member.role}</p>
                  <p className="text-gray-400 text-sm">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: "How does the AI matching work?",
                answer:
                  "Our proprietary algorithm analyzes creator content, audience demographics, engagement patterns, and brand requirements to suggest optimal partnerships.",
              },
              {
                question: "What types of creators can join?",
                answer:
                  "We welcome creators of all sizes, from micro-influencers (1K+ followers) to major content creators across various platforms and niches.",
              },
              {
                question: "How do brands benefit from Collab Junction?",
                answer:
                  "Brands gain access to authentic creator partnerships, targeted audience reach, streamlined collaboration workflows, and detailed performance analytics.",
              },
              {
                question: "Is there a fee to join?",
                answer:
                  "Creators can join for free. Brands have flexible subscription options based on collaboration volume and feature requirements.",
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default About
