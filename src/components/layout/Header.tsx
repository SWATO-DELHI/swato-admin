'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignInModal } from '@/components/auth/SignInModal';
import { SignUpModal } from '@/components/auth/SignUpModal';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export function Header() {
  const { getTotalItems, setIsCartOpen } = useCart();
  return (
    <header className="bg-[#F2521B] shadow-xl" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
      <div className="max-w-full mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo - positioned to the left */}
          <div className="flex-shrink-0 ml-4 lg:ml-40">
            <Link href="/" className="flex items-center group">
              <Image
                src="/assets/images/logos/translogo/swatousertrans.png"
                alt="Swato"
                width={160}
                height={50}
                className="h-38 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Right side navigation - positioned far to the right */}
          <div className="flex items-center">
            <nav className="flex items-center space-x-6 lg:space-x-8">
              <Link
                href="/corporate"
                className="text-white hover:text-gray-200 font-bold transition-all duration-300 text-base hover:scale-105"
              >
                Swato Corporate
              </Link>
                  <Link
                    href="/partner"
                    className="text-white hover:text-gray-200 font-bold transition-all duration-300 text-base hover:scale-105"
                  >
                    Partner with us
                  </Link>

                  {/* Search Button */}
                  <Link href="/search">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 font-bold transition-all duration-300 text-base hover:scale-105"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search Food
                    </Button>
                  </Link>

                  {/* Get the app Button */}
              <Button
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#f55d1c] font-bold px-6 py-2.5 rounded-lg transition-all duration-300 text-base flex items-center hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                Get the app
                <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>

              {/* Sign Up Button */}
              <SignUpModal />

              {/* Cart Button */}
              <Button
                variant="outline"
                onClick={() => setIsCartOpen(true)}
                className="relative bg-white border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>

              {/* Sign In Button */}
              <SignInModal />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
