'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { data: session } = useSession()

  const creators = [
    { name: 'Priter Pete', followers: '20k Followers', image: '/placeholder.svg?height=300&width=300' },
    { name: 'Radaan Maini', followers: '25k Followers', image: '/placeholder.svg?height=300&width=300' },
    { name: 'Raiana Knight', followers: '37k Followers', image: '/placeholder.svg?height=300&width=300' },
    { name: 'Rani Vankov', followers: '31k Followers', image: '/placeholder.svg?height=300&width=300' }
  ]

  const brands = [
    { name: 'Starbucks', image: '/placeholder.svg?height=100&width=100' },
    { name: 'Jack Daniels', image: '/placeholder.svg?height=100&width=100' },
    { name: 'Coca Cola', image: '/placeholder.svg?height=100&width=100' },
    { name: 'Nike', image: '/placeholder.svg?height=100&width=100' },
    { name: 'Red Bull', image: '/placeholder.svg?height=100&width=100' }
  ]

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="bg-[#111] rounded-3xl overflow-hidden mt-6">
        <div className="relative h-[400px]">
          <Image
            src="/placeholder.svg?height=800&width=1200"
            alt="Collaboration"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Easy Way to <span className="text-yellow-400">collaborate</span> with <br />
              <span className="text-yellow-400">brands</span> and grow as a <span className="text-yellow-400">creator</span>
            </h1>
            <p className="text-gray-300 max-w-3xl mb-8 text-sm">
              Pizza ipsum dolor meat lovers buffalo. Extra crust string ham peppers. Buffalo topping thin crust white
              large mozzarella. Pesto wing marinara ham tomato. Garlic parmesan banana garlic pineapple mushrooms bell
              string meat.
            </p>

            {/* sign-up buttons visible only when no active session */}
            {!session && (
              <div className="flex gap-4">
                <Link href="/sign-upcreator">
                  <button className="bg-white text-black hover:bg-gray-200 rounded-full px-8 border border-black">
                    I&apos;m a Creator
                  </button>
                </Link>
                <Link href="/sign-upbrand">
                  <button className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full px-8">
                    I&apos;m a Brand
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] rounded-3xl overflow-hidden">
          <div className="relative h-[300px]">
            <Image src="/placeholder.svg?height=600&width=600" alt="Creator" fill className="object-cover" />
            <div className="absolute bottom-4 left-4">
              <h2 className="text-3xl font-bold text-yellow-400">Creator</h2>
            </div>
          </div>
        </div>

        {/* what we offer (creator) */}
        <div className="bg-[#111] rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">What do we offer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-[#222] rounded-xl p-4">
                <div className="flex justify-center mb-2">
                  <div className="bg-[#333] p-2 rounded-full">
                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                      <path d="M10 5a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 00-1 1v3a1 1 0 002 0V11a1 1 0 00-1-1z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-center text-white font-semibold mb-2">Benefit</h3>
                <p className="text-gray-400 text-xs">
                  Pizza ipsum dolor meat lovers buffalo. Chicken spinach pineapple meatball fresh string tomatoes.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* what we offer (brand) */}
        <div className="bg-[#111] rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">What do we offer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-[#222] rounded-xl p-4">
                <div className="flex justify-center mb-2">
                  <div className="bg-[#333] p-2 rounded-full">
                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                      <path d="M10 5a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 00-1 1v3a1 1 0 002 0V11a1 1 0 00-1-1z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-center text-white font-semibold mb-2">Benefit</h3>
                <p className="text-gray-400 text-xs">
                  Pizza ipsum dolor meat lovers buffalo. Chicken spinach pineapple meatball fresh string tomatoes.
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#111] rounded-3xl overflow-hidden">
          <div className="relative h-[300px]">
            <Image src="/placeholder.svg?height=600&width=600" alt="Brand" fill className="object-cover" />
            <div className="absolute bottom-4 left-4">
              <h2 className="text-3xl font-bold text-yellow-400">Brand</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Collaborations */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Brand Collaborations</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {brands.map((brand, i) => (
            <div key={i} className="w-20 h-20 relative">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/30 p-1">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={brand.image}
                    alt={`Logo of ${brand.name}`}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Creator Spotlight */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Creator Spotlight</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {creators.map((creator, i) => (
            <div key={i} className="bg-[#111] rounded-xl overflow-hidden">
              <div className="relative h-48">
                <Image src={creator.image} alt={`Image of ${creator.name}`} fill className="object-cover" />
                <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-white font-medium">{creator.name}</h3>
                <p className="text-yellow-400 text-sm">{creator.followers}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Want your brand deals to sky rocket?</h2>
        <h3 className="text-3xl font-bold text-yellow-400 mb-8">Join Us !</h3>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-[#222] p-4 rounded-full">
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-bold mb-4">For Creators</h3>
            <p className="text-gray-400 text-sm mb-6">
              Pizza ipsum dolor meat lovers buffalo. Chicken spinach pineapple meatball fresh string tomatoes.
            </p>

            {/* CTA buttons hidden if logged in */}
            {!session && (
              <Button variant="outline" className="bg-white text-black hover:bg-gray-200 rounded-full px-8">
                I&apos;m a Creator
              </Button>
            )}
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-[#222] p-4 rounded-full">
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814l-4.419-3.35-4.419 3.35A1 1 0 014 16V4zm2-1h8a1 1 0 011 1v10.586l-3.419-2.59a1 1 0 00-1.162 0L7 14.586V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-bold mb-4">For Brands</h3>
            <p className="text-gray-400 text-sm mb-6">
              Pizza ipsum dolor meat lovers buffalo. Chicken spinach pineapple meatball fresh string tomatoes.
            </p>

            {!session && (
              <Button className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full px-8">
                I&apos;m a Brand
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
