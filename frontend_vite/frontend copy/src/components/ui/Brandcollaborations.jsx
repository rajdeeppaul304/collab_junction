import React from 'react';

const brands = [
  { name: 'Starbucks', src: '/starbucks.jpg' },
  { name: 'Jack Daniels', src: '/jackdaniels.jpg' },
  { name: 'Coca Cola', src: '/cocacola.jpg' },
  { name: 'Adidas', src: '/adidas.jpg' },
  { name: 'Red Bull', src: '/redbull.jpg' },
];

const BrandCollaborations = () => {
  return (
    <>
      {/* Title Section */}
      <section className="bg-black py-8 w-[600px] h-[70px] center mx-auto rounded-t-3xl">
        <p className="text-white text-5xl font-semibold text-center mt-[-20px] ">
          Brand Collaborations
        </p>
      </section>

      {/* Logos Section */}
      <section className="bg-black w-full py-12 flex flex-col   items-center justify-center">
        <div className="flex justify-center gap-9 flex-wrap">
          {brands.map((brand, index) => (
            <div key={index} className="p-2 rounded-full bg-black">
              <div className="w-[230px] h-[230px] rounded-full border-4 border-dashed border-white overflow-hidden flex items-center justify-center">
                <img
                  src={brand.src}
                  alt={brand.name}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default BrandCollaborations;


