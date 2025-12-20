'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function DownloadAppSection() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-pink-50 via-orange-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFA07A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            What's waiting for you
            <br />
            on the app?
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Our app is packed with features that
            <br />
            enable you to experience food
            <br />
            delivery like never before
          </p>
        </div>

        {/* Main Content */}
        <div className="relative flex items-center justify-center">
          {/* Left Feature Cards */}
          <div className="absolute left-0 md:left-20 space-y-6">
            {/* Healthy */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-32 text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in-left">
              <div className="mb-3">
                <Image
                  src="/assets/images/downloadapp/healthy.avif"
                  alt="Healthy"
                  width={60}
                  height={60}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Healthy
              </p>
            </div>

            {/* Plan a Party */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-32 text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in-left" style={{ animationDelay: '0.1s' }}>
              <div className="mb-3">
                <Image
                  src="/assets/images/downloadapp/party.avif"
                  alt="Plan a Party"
                  width={60}
                  height={60}
                  className="mx-auto"
                />
              </div>
              <p className="text-xs font-semibold text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Plan
                <br />
                a Party
              </p>
            </div>
          </div>

          {/* Center Left Features */}
          <div className="absolute left-32 md:left-56 space-y-6">
            {/* Toggle/Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-32 text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
              <div className="mb-3">
                <Image
                  src="/assets/images/downloadapp/toggle.avif"
                  alt="Toggle/Filters"
                  width={60}
                  height={60}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Filters
              </p>
            </div>

            {/* Gift Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-32 text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in-left" style={{ animationDelay: '0.3s' }}>
              <div className="mb-3">
                <Image
                  src="/assets/images/downloadapp/gift.avif"
                  alt="Gift Cards"
                  width={60}
                  height={60}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Gift Cards
              </p>
            </div>
          </div>

          {/* Center Phone Mockup */}
          <div className="z-10 relative">
            <Image
              src="/assets/images/downloadapp/phone.avif"
              alt="Swato App"
              width={280}
              height={560}
              className="drop-shadow-2xl"
            />
            {/* Swato Logo Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/assets/images/logos/swato.png"
                alt="Swato"
                width={120}
                height={40}
                className="w-24 h-auto opacity-90"
              />
            </div>
          </div>

          {/* Right Feature Cards */}
          <div className="absolute right-32 md:right-56 space-y-6">
            {/* Food Delivery */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-32 text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in-right">
              <div className="mb-3">
                <Image
                  src="/assets/images/downloadapp/food-delivery.png"
                  alt="Food Delivery"
                  width={60}
                  height={60}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Delivery
              </p>
            </div>

            {/* Offers */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-32 text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in-right" style={{ animationDelay: '0.1s' }}>
              <div className="mb-3">
                <Image
                  src="/assets/images/downloadapp/offers.avif"
                  alt="Offers"
                  width={60}
                  height={60}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Offers
              </p>
            </div>
          </div>

          {/* Center Right Features */}
          <div className="absolute right-0 md:right-20 space-y-6">
            {/* Collections */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-32 text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
              <div className="mb-3">
                <Image
                  src="/assets/images/downloadapp/collections.avif"
                  alt="Collections"
                  width={60}
                  height={60}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Collections
              </p>
            </div>

            {/* Party */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-32 text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in-right" style={{ animationDelay: '0.3s' }}>
              <div className="mb-3">
                <Image
                  src="/assets/images/downloadapp/party.avif"
                  alt="Party"
                  width={60}
                  height={60}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Party
              </p>
            </div>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex justify-center items-center gap-8 mt-16">
          <div className="flex items-center justify-center w-32 h-32 md:w-36 md:h-36">
            <a
              href="#"
              aria-label="Download on the App Store"
              className="block transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg"
            >
              <Image
                src="/assets/images/icons/appstore.png"
                alt="Download on App Store"
                width={140}
                height={140}
                className="w-full h-full object-contain drop-shadow-lg hover:drop-shadow-xl"
              />
            </a>
          </div>

          <div className="flex items-center justify-center w-32 h-32 md:w-36 md:h-36">
            <a
              href="#"
              aria-label="Get it on Google Play"
              className="block transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg"
            >
              <Image
                src="/assets/images/icons/playstore.png"
                alt="Get it on Google Play"
                width={140}
                height={140}
                className="w-full h-full object-contain drop-shadow-lg hover:drop-shadow-xl"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
