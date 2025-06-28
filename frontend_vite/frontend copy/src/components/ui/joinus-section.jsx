"use client"
import { useNavigate } from "react-router-dom"

const creatorFeatures = [
  "Pizza ipsum dolor meat lovers buffalo. White pie pepperoni meat parmesan.",
  "Green pineapple green tomatoes buffalo mouth pineapple.",
  "Pie ricotta bianca green bacon ham roll bell. Peppers bacon ranch green hand extra banana bell mozzarella.",
  "Tossed roll sautéed cheese mushrooms broccoli bianca style garlic Chicago.",
  "Hawaiian mushrooms Chicago olives bacon extra thin beef.",
  "Philly pork tossed large party red fresh style and lasagna.",
  "Marinara bell burnt wing bianca meatball style red.",
  "Bell dolor platter tomato bianca Hawaiian tossed.",
]

const brandFeatures = [...creatorFeatures]

export default function JoinUsSection() {
  const navigate = useNavigate()

  const handleClick = (role) => {
    navigate(`/signup?role=${role}`)
  }

  return (
    <div className="w-full min-h-screen bg-[#171717] py-16 px-4 mt-[-50px]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-[36px] md:text-[48px] font-bold text-white mb-2">
            Want your brand deals to skyrocket?
          </h2>
          <h1 className="text-[48px] md:text-[72px] font-bold text-[#FFF93D]">
            Join Us!
          </h1>
        </div>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* For Creators Card */}
          <div className="bg-[#1E1E1E] rounded-2xl p-6 text-white max-w-sm mx-auto">
            {/* Icon */}
            <div className="flex justify-center mt-4 mb-6">
              <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center">
                <img
                  src="/public/covid_social-distancing-man.png"
                  alt="Creator Icon"
                  className="w-[100px] h-[100px] object-contain"
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-center mb-6">For Creators</h2>

            {/* Features List */}
            <ul className="mb-6 text-[11px] font-bold leading-normal px-4">
              {creatorFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-white mr-2">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Button */}
            <div className="flex justify-center">
              <button
                onClick={() => handleClick("creator")}
                className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold text-2xl hover:bg-gray-100 transition-colors duration-200"
              >
                I'm a Creator
              </button>
            </div>
          </div>

          {/* For Brands Card */}
          <div className="bg-[#1E1E1E] rounded-2xl p-6 text-white max-w-sm mx-auto">
            {/* Icon */}
            <div className="flex justify-center mt-4 mb-6">
              <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center">
                <img
                  src="/public/mdi_company.png"
                  alt="Brand Icon"
                  className="w-[100px] h-[100px] object-contain"
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-center mb-6">For Brands</h2>

            {/* Features List */}
            <ul className="mb-6 text-[11px] font-bold leading-normal px-4">
              {brandFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-white mr-2">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Button */}
            <div className="flex justify-center">
              <button
                onClick={() => handleClick("brand")}
                className="bg-[#FFF93D] text-gray-800 px-6 py-2 rounded-full font-semibold text-2xl hover:bg-yellow-500 transition-colors duration-200"
              >
                I'm a Brand
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
