import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import MainLayout from "../components/layout/MainLayout"
import Button from "../components/ui/Button"
import CreatorSpotlight from "../components/ui/creatorcard"
import JoinUsSection from "../components/ui/joinus-section"
import BrandCollaborations from "../components/ui/Brandcollaborations"

const Home = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden mb-8 sm:mb-12 w-full max-w-[1460px] mx-auto border-b-4 border-black shadow-2xl h-[560px] sm:h-[640px] lg:h-[700px]"
        >
          {/* Background image with reduced opacity */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-[url('/1.jpg')] bg-no-repeat bg-top bg-cover opacity-40 transition-transform duration-1000 scale-100 hover:scale-105" />
            <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-black to-transparent" />
          </div>

          {/* Foreground content */}
          <div className="relative z-10 flex items-center justify-center h-full px-6 sm:px-8 md:px-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center max-w-4xl"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl mb-6 sm:mb-8 text-white leading-tight font-semibold">
                Easy Way to <span className="text-yellow-300">collaborate with</span>
                <div className="h-2 sm:h-5" />
                <span className="text-yellow-300">brands</span> and grow as a{" "}
                <span className="text-yellow-300">creator</span>
              </h1>

              <p className="mt-4 sm:mt-10 text-gray-200 mb-8 sm:mb-10 text-base sm:text-lg max-w-3xl mx-auto">
                Collab Junction connects creators with brands for authentic, AI-matched collaborations —
                discover products you love, express interest in a click, and turn your influence into real partnerships.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-16">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Link to="/signup?role=creator" className="w-full sm:w-auto block">
                    <Button className="w-full sm:w-[260px] h-[60px] sm:h-[70px] px-6 py-3 bg-white text-black font-semibold border border-white rounded-[20px] text-base hover:bg-gray-100 shadow-xl cursor-pointer">
                      I'm a Creator
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Link to="/signup?role=brand" className="w-full sm:w-auto block">
                    <Button className="w-full sm:w-[260px] h-[60px] sm:h-[70px] px-6 py-3 bg-yellow-400 text-black font-semibold border border-yellow-300 rounded-[20px] text-base hover:bg-yellow-300 shadow-xl cursor-pointer">
                      I'm a Brand
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <div className="flex flex-col gap-16 sm:gap-20 px-2 sm:px-4 py-10 max-w-[1626px] mx-auto">
          {/* Section: What do we offer */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="w-full bg-black rounded-2xl sm:rounded-3xl shadow-sm mx-auto p-6 sm:p-10 border border-neutral-900"
          >
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
              {/* Left - Image */}
              <div className="w-full lg:w-1/2 flex justify-center items-center">
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  src="/2.jpg"
                  alt="Creators collaborating with brands"
                  className="w-full max-w-[550px] h-[320px] sm:h-[450px] lg:h-[600px] object-cover rounded-3xl shadow-lg border border-gray-700"
                />
              </div>

              {/* Right - Heading and Boxes */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <p className="text-3xl sm:text-4xl lg:text-[56px] text-white mb-6 sm:mb-8 font-semibold text-center lg:text-left">
                  What do we offer?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ y: -6, borderColor: "#EAB308" }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#171717] border border-[#2A2A2A] p-6 sm:p-8 rounded-xl shadow-md flex flex-col items-center text-center cursor-default transition-colors"
                  >
                    <img src="/Vector.png" alt="" className="mb-4 h-14 w-14 sm:h-[84px] sm:w-[84px]" />
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-4">Smart Matching</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Our AI pairs your brand with creators who genuinely fit your niche, audience, and values — so every collaboration feels authentic instead of forced.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -6, borderColor: "#EAB308" }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#171717] border border-[#2A2A2A] p-6 sm:p-8 rounded-xl shadow-md flex flex-col items-center text-center cursor-default transition-colors"
                  >
                    <img src="/Vector2.png" alt="" className="mb-4 h-14 w-14 sm:h-[84px] sm:w-[84px]" />
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-4">Effortless Growth</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      From discovery to payout, we streamline the entire collaboration process so creators can focus on making great content and brands can focus on results.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section: Why creators love it */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="w-full bg-black rounded-2xl sm:rounded-3xl shadow-sm mx-auto p-6 sm:p-10 border border-neutral-900"
          >
            <div className="flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-14">
              {/* Right - Image */}
              <div className="w-full lg:w-1/2 flex justify-center items-center">
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  src="/1.jpg"
                  alt="Brand collaboration in progress"
                  className="w-full max-w-[550px] h-[320px] sm:h-[450px] lg:h-[600px] object-cover rounded-3xl shadow-lg border border-gray-700"
                />
              </div>

              {/* Left - Heading and Boxes */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <p className="text-3xl sm:text-4xl lg:text-[56px] text-white mb-6 sm:mb-8 font-semibold text-center lg:text-left">
                  Why creators love it
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ y: -6, borderColor: "#EAB308" }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#171717] border border-[#2A2A2A] p-6 sm:p-8 rounded-xl shadow-md flex flex-col items-center text-center cursor-default transition-colors"
                  >
                    <img src="/Vector.png" alt="" className="mb-4 h-14 w-14 sm:h-[84px] sm:w-[84px]" />
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-4">Real Products</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Browse a curated catalog of brand products, express interest with one click, and let brands come to you with collaboration offers.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -6, borderColor: "#EAB308" }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#171717] border border-[#2A2A2A] p-6 sm:p-8 rounded-xl shadow-md flex flex-col items-center text-center cursor-default transition-colors"
                  >
                    <img src="/Vector2.png" alt="" className="mb-4 h-14 w-14 sm:h-[84px] sm:w-[84px]" />
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-4">Track Everything</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Manage your profile, monitor your collaborations, and grow your reach — all from a single, simple dashboard built for creators.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
        <section>
          <div>
            <BrandCollaborations />
          </div>
        </section>

        <section>
          <div>
            <CreatorSpotlight />
          </div>
        </section>

        <section>
          <div>
            <JoinUsSection />
          </div>
        </section>

      </div>
    </MainLayout>
  )
}

export default Home
