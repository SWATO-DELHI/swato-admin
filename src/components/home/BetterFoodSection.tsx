'use client';

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function BetterFoodSection() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Decorative curved lines */}
      <div className="absolute inset-0 opacity-30">
        <svg className="absolute top-0 left-0 w-96 h-96" viewBox="0 0 400 400">
          <path d="M 0,200 Q 100,50 200,200 T 400,200" fill="none" stroke="#FFB8A0" strokeWidth="2"/>
        </svg>
        <svg className="absolute bottom-0 right-0 w-96 h-96" viewBox="0 0 400 400">
          <path d="M 400,200 Q 300,350 200,200 T 0,200" fill="none" stroke="#FFB8A0" strokeWidth="2"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Floating Food Images */}
        <div className="relative">
          {/* Left - Burger */}
          <div className="absolute left-0 top-0 md:top-20 animate-float">
            <Image
              src="/assets/images/food-items/burger.avif"
              alt="Burger"
              width={300}
              height={300}
              className="w-48 md:w-72 lg:w-80"
            />
          </div>

          {/* Top Right - Momos */}
          <div className="absolute right-0 top-0 md:top-10 animate-float" style={{ animationDelay: '0.5s' }}>
            <Image
              src="/assets/images/food-items/momos.avif"
              alt="Momos"
              width={300}
              height={300}
              className="w-48 md:w-64 lg:w-72"
            />
          </div>

          {/* Bottom Right - Pizza */}
          <div className="absolute right-0 bottom-0 md:top-80 animate-float" style={{ animationDelay: '1s' }}>
            <Image
              src="/assets/images/food-items/pizza.avif"
              alt="Pizza"
              width={350}
              height={350}
              className="w-56 md:w-80 lg:w-96"
            />
          </div>



          {/* Center Content */}
          <div className="text-center py-32 md:py-40">
            <h2
              className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
              style={{
                background: 'linear-gradient(135deg, #F2521B 0%, #FF7A32 50%, #FFD7B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Better food for
              <br />
              more people
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              For over a decade, we've enabled our
              <br />
              customers to discover new tastes,
              <br />
              delivered right to their doorstep
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Multiple Cuisines */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-white-100 to-white-200 p-4 rounded-2xl">
                <Image
                  src="/assets/images/icons/food.png"
                  alt="Multiple Cuisines"
                  width={40}
                  height={40}
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              50+
            </h3>
            <p className="text-lg text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              cuisines
            </p>
          </div>

          {/* Daily Orders */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-white-100 to-white-200 p-4 rounded-2xl">
                <Image
                  src="/assets/images/icons/order-food.png"
                  alt="Daily Orders"
                  width={40}
                  height={40}
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              1000+
            </h3>
            <p className="text-lg text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              daily orders
            </p>
          </div>

          {/* Delivery Partners */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-white-100 to-white-200 p-4 rounded-2xl">
                <Image
                  src="/assets/images/icons/restaurant.png"
                  alt="Delivery Partners"
                  width={40}
                  height={40}
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              2,000+
            </h3>
            <p className="text-lg text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              delivery partners
            </p>
          </div>
        </div>
        </div>

        {/* Order Now Button */}
        <div className="mt-16 flex justify-center">
          <Button
            className="relative inline-flex items-center gap-2 bg-gradient-to-r from-[#F2521B] via-[#FF7A32] to-[#FFD7B8] hover:from-[#E4471A] hover:to-[#FFD7B8] text-white font-semibold px-8 md:px-12 py-3 rounded-full text-lg md:text-xl shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#ffa96a]/60 focus-visible:outline-none"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
            aria-label="Order Now"
          >
            <span className="mr-1">Order Now</span>
            <svg
              className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(242, 82, 27, 0.3);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 30px rgba(242, 82, 27, 0.5);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
