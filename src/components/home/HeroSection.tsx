'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import Image from 'next/image';

export function HeroSection() {
  const { location, detectLocation, isLoading } = useLocation();

  return (
    <section
      className="relative min-h-[600px] flex items-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F2521B 0%, #FF7A32 35%, #FFD7B8 70%, #FFF7F0 100%)'
      }}
    >
      {/* Background Food Images */}
      <div className="absolute inset-0">
        {/* Left side vegetables/food */}
        <div className="absolute left-0 top-0 bottom-0 w-[300px]">
          <Image
            src="/assets/images/hero/Veggies_new.avif"
            alt="Fresh Vegetables"
            fill
            className="object-contain object-left"
          />
        </div>

        {/* Right side food/sushi */}
        <div className="absolute right-0 top-0 bottom-0 w-[300px]">
          <Image
            src="/assets/images/hero/Sushi_replace.avif"
            alt="Delicious Food"
            fill
            className="object-contain object-right"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
        <div className="text-center">
          {/* Main Heading */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Order food & groceries. Discover
            <br />
            best restaurants. Swato it!
          </h1>

          {/* Search Bar Container */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* Location Input */}
              <div className="bg-white rounded-xl shadow-lg flex items-center px-6 py-4 flex-1 min-w-[280px]">
                <MapPin className="h-6 w-6 text-[#fc8019] mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Delivering to</div>
                  <div className="font-medium text-gray-900">
                    {location?.area || 'Delhi'}
                  </div>
                </div>
                <Button
                  onClick={detectLocation}
                  disabled={isLoading}
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-[#fc8019] hover:text-[#fc8019] hover:bg-orange-50"
                >
                  {isLoading ? '...' : 'Change'}
                </Button>
              </div>

              {/* Search Input */}
              <Link href="/search" className="flex-1 min-w-[280px]">
                <div className="bg-white rounded-xl shadow-lg flex items-center px-6 py-4 cursor-pointer hover:shadow-xl transition-shadow">
                  <Search className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for restaurant, item or more"
                    className="flex-1 bg-transparent border-0 focus:outline-none text-gray-700 placeholder-gray-400 text-base font-medium cursor-pointer"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                    readOnly
                  />
                </div>
              </Link>
            </div>
          </div>

            {/* Popular Food Categories */}
            <div className="mt-16">
              <h3 className="text-white text-xl font-semibold text-center mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Popular Cuisines
              </h3>
              <div className="flex justify-center gap-4 flex-wrap">
                {[
                  { name: 'Pizza', emoji: '🍕' },
                  { name: 'Burger', emoji: '🍔' },
                  { name: 'Biryani', emoji: '🍚' },
                  { name: 'Chinese', emoji: '🥡' },
                  { name: 'Italian', emoji: '🍝' },
                  { name: 'Dessert', emoji: '🍰' }
                ].map((cuisine) => (
                  <Link key={cuisine.name} href={`/search?cuisine=${cuisine.name.toLowerCase()}`}>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 cursor-pointer hover:bg-white/20 transition-colors">
                      <span className="text-2xl mr-2">{cuisine.emoji}</span>
                      <span className="text-white font-medium">{cuisine.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 flex justify-center gap-8 flex-wrap text-white">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>500+</div>
                <div className="text-sm opacity-90" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>10,000+</div>
                <div className="text-sm opacity-90" style={{ fontFamily: 'Montserrat, sans-serif' }}>Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>1M+</div>
                <div className="text-sm opacity-90" style={{ fontFamily: 'Montserrat, sans-serif' }}>Happy Customers</div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
