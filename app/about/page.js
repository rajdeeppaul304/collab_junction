import Image from "next/image"

export default function AboutPage() {
  // Benefits data
  const benefits = [
    {
      icon: "lightbulb",
      title: "Benefit Heading",
      description:
        "Pizza ipsum dolor meat lovers buffalo. Chicken spinach pineapple meatball fresh string tomatoes. Toasted fresh style mushroom bbq sautéed style lasagna stuffed. Ranch melted mayo style meat. Ricotta personal mayo pizza tomato lovers. String lasagna chicken string melted black olives.",
    },
    {
      icon: "target",
      title: "Benefit Heading",
      description:
        "Pizza ipsum dolor meat lovers buffalo. Chicken spinach pineapple meatball fresh string tomatoes. Toasted fresh style mushroom bbq sautéed style lasagna stuffed. Ranch melted mayo style meat. Ricotta personal mayo pizza tomato lovers. String lasagna chicken string melted black olives.",
    },
    {
      icon: "handshake",
      title: "Benefit Heading",
      description:
        "Pizza ipsum dolor meat lovers buffalo. Chicken spinach pineapple meatball fresh string tomatoes. Toasted fresh style mushroom bbq sautéed style lasagna stuffed. Ranch melted mayo style meat. Ricotta personal mayo pizza tomato lovers. String lasagna chicken string melted black olives.",
    },
    {
      icon: "brain",
      title: "Benefit Heading",
      description:
        "Pizza ipsum dolor meat lovers buffalo. Chicken spinach pineapple meatball fresh string tomatoes. Toasted fresh style mushroom bbq sautéed style lasagna stuffed. Ranch melted mayo style meat. Ricotta personal mayo pizza tomato lovers. String lasagna chicken string melted black olives.",
    },
  ]

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-[#111] rounded-3xl overflow-hidden mt-6">
        <div className="relative">
          <div className="relative h-[500px]">
            <Image
              src="/placeholder.svg?height=1000&width=1600"
              alt="About Collab Junction"
              fill
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About <span className="text-yellow-400">Collab Junction</span>: AI-
                <br />
                Powered Authentic <span className="text-yellow-400">Branding</span>
              </h1>
              <p className="text-white max-w-3xl mx-auto mb-8">
                We&apos;re revolutionizing how brands connect with audiences. Collab Junction leverages AI to match
                brands with relevant micro-influencers, automating collaborations to generate authentic social proof and
                massive reach at scale.
              </p>
              <p className="text-white max-w-3xl mx-auto">
                Our mission is to move beyond traditional advertising by fostering genuine partnerships that result in
                content people trust, driving real brand growth and enabling creators to thrive by sharing products they
                love.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="border border-yellow-400 rounded-3xl p-12 text-center">
        <h2 className="text-4xl font-bold text-yellow-400 mb-8">Our Vision</h2>
        <p className="text-white text-lg max-w-4xl mx-auto">
          We believe the future of marketing lies in genuine connection and trust. By leveraging AI to facilitate
          authentic collaborations at scale, Collab Junction aims to create a thriving ecosystem where both brands and
          creators achieve meaningful growth.
        </p>
      </section>

      {/* The power of AI on branding */}
      <section>
        <h2 className="text-3xl font-bold text-white text-center mb-12">The power of AI on branding</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-[#111] rounded-xl p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-[#222] p-3 rounded-full">
                  {benefit.icon === "lightbulb" && (
                    <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                  )}
                  {benefit.icon === "target" && (
                    <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12zm0-2a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  )}
                  {benefit.icon === "handshake" && (
                    <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {benefit.icon === "brain" && (
                    <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="text-white font-bold text-center mb-4">{benefit.title}</h3>
              <p className="text-gray-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
