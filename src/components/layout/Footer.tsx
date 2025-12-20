import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/assets/images/logos/swato.png"
              alt="Swato"
              width={120}
              height={40}
              className="h-8 w-auto brightness-0 invert"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Swato is your go-to food delivery platform, connecting you with the best restaurants
              in your city. Fresh food, fast delivery, great prices.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/team" className="text-gray-400 hover:text-white transition-colors">Team</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* For Restaurants */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Restaurants</h3>
            <ul className="space-y-2">
              <li><Link href="/partner" className="text-gray-400 hover:text-white transition-colors">Partner With Us</Link></li>
              <li><Link href="/apps" className="text-gray-400 hover:text-white transition-colors">Apps For You</Link></li>
              <li><Link href="/restaurant-login" className="text-gray-400 hover:text-white transition-colors">Restaurant Login</Link></li>
              <li><Link href="/restaurant-signup" className="text-gray-400 hover:text-white transition-colors">Restaurant Signup</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help & Support</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="text-gray-400 hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="font-semibold text-lg mb-2">Download our app</h3>
              <p className="text-gray-400 text-sm">Get the best experience on our mobile app</p>
            </div>
            <div className="flex space-x-4">
              <div className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="text-white font-medium text-sm">GET IT ON</div>
                  <div className="text-white font-bold">Google Play</div>
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="text-white font-medium text-sm">Download on the</div>
                  <div className="text-white font-bold">App Store</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Swato. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">Sitemap</Link>
              <Link href="/accessibility" className="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
