import { Link } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import CreatorSpotlight from "../components/ui/creatorcard"
import JoinUsSection from "../components/ui/joinus-section"
import BrandCollaborations from "../components/ui/Brandcollaborations"


const Home = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Hero Section */}
        <section className="relative rounded-lg overflow-hidden mb-8 sm:mb-12 w-full">
          {/* Outer wrapper */}
          <div className="relative w-full mx-auto">
            {/* Background + Overlay */}
            <div className="relative bg-[url('/1.jpg')] bg-no-repeat bg-top bg-cover h-[700px] flex items-center justify-center px-6 sm:px-8 md:px-12 border-b-4 border-black rounded-3xl shadow-2xl overflow-hidden w-[1460px] mx-auto opacity-80">

              {/* Bottom shadow overlay */}
              <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-black to-transparent pointer-events-none z-0" />

              {/* Content */}
              <div className="relative z-10 max-w-4xl text-center mt-[10px]">
                <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 text-white">
                  Easy Way to <span className="text-yellow-400">collaborate</span> with <br className="hidden sm:block" />
                  <span className="text-yellow-400">brands</span> and grow as a{" "}
                  <span className="text-yellow-400">creator</span>
                </h1>
                <p className="text-gray-300 mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
                  Connect with brands that align with your values, showcase your talent, and earn through authentic
                  collaborations.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                  <Link to="/signup">
                    <Button variant="outline" className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg">
                      I'm a Creator
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg">
                      I'm a Brand
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-20 px-4 py-10 max-w-[1626px] mx-auto mt-[-50px]">
          <section className="w-full bg-black min-h-[770px] rounded-xl shadow-sm mx-auto mt-[-1px]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 h-full">
              {/* Left - Image */}
              <div className="w-[385px] md:w-[550px] h-[770px] rounded-2xl flex justify-center items-center">
                <img
                  src="../public/2.jpg"
                  alt="Main Visual"
                  className="w-full h-full max-w-[770px] rounded-3xl shadow-lg border border-gray-300"
                />
              </div>

              {/* Right - Heading and Boxes */}
              <div className="w-full md:w-1/2 flex flex-col mr-14">
                {/* Heading aligned to start from first card */}
                <p className="text-[64px] text-white mb-8 text-left ">What do we offer?</p>

                {/* Boxes moved down */}
                <div className="flex flex-row gap-6 mt-4  ">
                  <div className="bg-[#171717] mr-10 p-8 rounded-xl shadow-md flex flex-col items-center text-center h-[523px] w-[362px] ">
                    <img src="/public/Vector.png" alt="Logo 1" className="mb-4 h-[84px] w-[84px]" />
                    <h3 className="text-[40px] font-semibold text-white mb-4">Benefit</h3>
                    <p className="text-white text-[12px] text-center ">Pizza ipsum dolor meat lovers buffalo. White pie pepperoni meat parmesan. Green pineapple green tomatoes buffalo mouth pineapple. Pie ricotta Bianca green bacon ham roll bell. Peppers bacon ranch green hand extra banana bell mozzarella. Tossed roll sautéed cheese mushrooms broccoli Bianca style garlic Chicago. Hawaiian mushrooms Chicago olives bacon extra thin beef. Philly pork tossed large party red fresh style and lasagna. Marinara bell burnt wing Bianca meatball style red. Bell dolor platter tomato Bianca Hawaiian tosse</p>
                  </div>
                  <div className="bg-[#171717] p-8 rounded-xl shadow-md flex flex-col items-center text-center h-[523px] w-[362px] mx-10">
                    <img src="/public/Vector2.png" alt="Logo 2" className="mb-4 h-[84px] w-[84px]" />
                    <h3 className="text-[40px] font-semibold text-white mb-4">Benefit</h3>
                    <p className="text-white  text-[12px]">Pizza ipsum dolor meat lovers buffalo. White pie pepperoni meat parmesan. Green pineapple green tomatoes buffalo mouth pineapple. Pie ricotta Bianca green bacon ham roll bell. Peppers bacon ranch green hand extra banana bell mozzarella. Tossed roll sautéed cheese mushrooms broccoli Bianca style garlic Chicago. Hawaiian mushrooms Chicago olives bacon extra thin beef. Philly pork tossed large party red fresh style and lasagna. Marinara bell burnt wing Bianca meatball style red. Bell dolor platter tomato Bianca Hawaiian tossed.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>



          <section className="w-full bg-black min-h-[700px] rounded-xl shadow-sm mx-auto mt-[-50px]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 h-full">
              {/* Left - Heading and Boxes */}
              <div className="w-full md:w-1/2 flex flex-col ml-14">
                {/* Heading aligned to start from first card */}
                <p className="text-[64px] text-white mb-8 ml-14 ">What do we offer?</p>

                {/* Boxes moved down */}
                <div className="flex flex-row gap-24 mt-4   ">
                  <div className="bg-[#171717] ml-20 p-8 rounded-xl shadow-md flex flex-col items-center text-center h-[523px] w-[362px] ">
                    <img src="/public/Vector.png" alt="Logo 1" className="mb-4 h-[84px] w-[84px]" />
                    <h3 className="text-[40px] font-semibold text-white mb-4">Benefit</h3>
                    <p className="text-white text-[12px] text-center ">Pizza ipsum dolor meat lovers buffalo. White pie pepperoni meat parmesan. Green pineapple green tomatoes buffalo mouth pineapple. Pie ricotta Bianca green bacon ham roll bell. Peppers bacon ranch green hand extra banana bell mozzarella. Tossed roll sautéed cheese mushrooms broccoli Bianca style garlic Chicago. Hawaiian mushrooms Chicago olives bacon extra thin beef. Philly pork tossed large party red fresh style and lasagna. Marinara bell burnt wing Bianca meatball style red. Bell dolor platter tomato Bianca Hawaiian tosse</p>
                  </div>
                  <div className="bg-[#171717] p-8 rounded-xl shadow-md flex flex-col items-center text-center h-[523px] w-[362px] ">
                    <img src="/public/Vector2.png" alt="Logo 2" className="mb-4 h-[84px] w-[84px]" />
                    <h3 className="text-[40px] font-semibold text-white mb-4">Benefit</h3>
                    <p className="text-white  text-[12px]">Pizza ipsum dolor meat lovers buffalo. White pie pepperoni meat parmesan. Green pineapple green tomatoes buffalo mouth pineapple. Pie ricotta Bianca green bacon ham roll bell. Peppers bacon ranch green hand extra banana bell mozzarella. Tossed roll sautéed cheese mushrooms broccoli Bianca style garlic Chicago. Hawaiian mushrooms Chicago olives bacon extra thin beef. Philly pork tossed large party red fresh style and lasagna. Marinara bell burnt wing Bianca meatball style red. Bell dolor platter tomato Bianca Hawaiian tossed.</p>
                  </div>
                </div>
              </div>


              {/* Right - Image with reduced width */}
              <div className="w-[385px] md:w-[550px] h-[770px] rounded-2xl flex justify-center items-center">
                <img
                  src="../public/2.jpg"
                  alt="Main Visual"
                  className="w-full h-full max-w-[770px] rounded-3xl mr-[-14px] shadow-lg border border-gray-300"
                />
              </div>
            </div>
          </section>

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



    </MainLayout >
  )
}

export default Home
