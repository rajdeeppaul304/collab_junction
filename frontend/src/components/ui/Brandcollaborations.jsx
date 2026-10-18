import React from 'react';

const brands = [
  { name: 'Starbucks' },
  { name: 'Jack Daniels' },
  { name: 'Coca Cola' },
  { name: 'Adidas' },
  { name: 'Red Bull' },
];

const BrandCollaborations = () => {
  return (
    <>
      {/* Title Section */}
      <section className="bg-black py-6 sm:py-8 w-full max-w-[600px] mx-auto rounded-t-3xl px-4">
        <p className="text-white text-2xl sm:text-4xl lg:text-5xl font-semibold text-center">
          Brand Collaborations
        </p>
      </section>

      {/* Logos Section */}
      <section className="bg-black w-full py-10 sm:py-12 flex flex-col items-center justify-center">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-9 px-4">
          {brands.map((brand, index) => (
            <div key={index} className="p-2 rounded-full bg-black">
              <div className="w-28 h-28 sm:w-[180px] sm:h-[180px] lg:w-[230px] lg:h-[230px] rounded-full border-4 border-dashed border-white overflow-hidden flex items-center justify-center bg-[#1E1E1E]">
                <span className="text-white text-sm sm:text-lg font-semibold text-center px-3">
                  {brand.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default BrandCollaborations;


