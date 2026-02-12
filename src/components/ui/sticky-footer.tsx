'use client';

import React from 'react';
import { cn } from '@/utils';
import { motion, useReducedMotion } from 'motion/react';
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  TwitterIcon,
} from 'lucide-react';
import { Button } from './button';
import Image from 'next/image';

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterLinkGroup {
  label: string;
  links: FooterLink[];
}

type StickyFooterProps = React.ComponentProps<'footer'>;

export function StickyFooter({ className, ...props }: StickyFooterProps) {
  return (
    <footer
      className={cn('relative h-screen w-full', className)}
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
      {...props}
    >
      <div className="fixed bottom-0 h-screen w-full">
        <div className="sticky top-0 h-full overflow-y-auto">
          <div
            className="relative flex size-full flex-col justify-between gap-8 border-t border-gray-200 px-6 py-12 md:px-16 lg:px-20"
            style={{
              background: 'linear-gradient(180deg, #FFF7F0 0%, #FFD7B8 40%, #FF7A32 75%, #F2521B 100%)'
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 isolate z-0 contain-strict"
            >
              <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(239,72,21,0.03)_0,rgba(255,122,50,0.02)_50%,rgba(255,215,184,0.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full" />
              <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(239,72,21,0.02)_0,rgba(255,122,50,0.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full" />
              <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(239,72,21,0.02)_0,rgba(255,122,50,0.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 rounded-full" />
            </div>

            <div className="mt-16 flex flex-col gap-12 md:flex-row xl:mt-8 z-10 relative">

              {/* Company Info & Download */}
              <AnimatedContainer className="w-full max-w-sm min-w-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/assets/images/logos/swato.png"
                    alt="Swato"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <h3 className="text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Swato</h3>
                </div>

                <p className="text-muted-foreground mt-8 text-sm md:mt-0 font-medium">
                  Delicious food delivered fast. Order from your favorite restaurants
                  and get it delivered to your doorstep in minutes.
                </p>

                {/* Download Buttons */}
                <div className="flex gap-3 mt-6">
                  <a
                    href="#"
                    aria-label="Download on the App Store"
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    <Image
                      src="/assets/images/icons/appstore.png"
                      alt="App Store"
                      width={120}
                      height={40}
                      className="h-10 w-auto"
                    />
                  </a>
                  <a
                    href="#"
                    aria-label="Get it on Google Play"
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    <Image
                      src="/assets/images/icons/playstore.png"
                      alt="Google Play"
                      width={120}
                      height={40}
                      className="h-10 w-auto"
                    />
                  </a>
                </div>

                {/* Social Links */}
                <div className="flex gap-2 mt-4">
                  {socialLinks.map((link) => (
                    <Button key={link.title} size="icon" variant="outline" className="size-8 border-orange-300 hover:border-[#ef4815] hover:bg-orange-50">
                      <link.icon className="size-4 text-[#ef4815]" />
                    </Button>
                  ))}
                </div>

              </AnimatedContainer>

              {/* Footer Link Groups */}
              {footerLinkGroups.map((group, index) => (
                <AnimatedContainer
                  key={group.label}
                  delay={0.1 + index * 0.1}
                  className="w-full"
                >
                  <div className="mb-10 md:mb-0">
                    <h3 className="text-sm font-semibold uppercase text-[#ef4815] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>{group.label}</h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      {group.links.map((link) => (
                        <li key={link.title}>
                          <a
                            href={link.href}
                            className="hover:text-[#ef4815] inline-flex items-center transition-all duration-300 text-sm font-medium"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {link.icon && <link.icon className="me-2 size-4" />}
                            {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedContainer>
              ))}
            </div>

            <div className="text-muted-foreground relative flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm md:flex-row px-4 md:px-0">
              {/* Delivery Image on the right above the line */}
                <div className="absolute top-0 right-4 transform -translate-y-full">
                  <Image
                    src="/assets/images/icons/deliveryboy1.png"
                    alt="Delivery Boy"
                    width={80}
                    height={80}
                    className="w-40 h-40"
                  />
                </div>

              <p className="font-medium">© 2024 Swato. All rights reserved.</p>
              <div className="flex gap-6 text-xs">
                <a href="#" className="hover:text-[#ef4815] transition-colors font-medium">Privacy Policy</a>
                <a href="#" className="hover:text-[#ef4815] transition-colors font-medium">Terms of Service</a>
                <a href="#" className="hover:text-[#ef4815] transition-colors font-medium">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const socialLinks = [
  { title: 'Facebook', href: '#', icon: FacebookIcon },
  { title: 'Instagram', href: '#', icon: InstagramIcon },
  { title: 'Youtube', href: '#', icon: YoutubeIcon },
  { title: 'Twitter', href: '#', icon: TwitterIcon },
];

const footerLinkGroups: FooterLinkGroup[] = [
  {
    label: 'For Restaurants',
    links: [
      { title: 'Partner with us', href: '#' },
      { title: 'Apps for you', href: '#' },
      { title: 'Restaurant signup', href: '#' },
      { title: 'Restaurant login', href: '#' },
    ],
  },
  {
    label: 'For Delivery Partners',
    links: [
      { title: 'Partner with us', href: '#' },
      { title: 'Apps for you', href: '#' },
      { title: 'Delivery partner signup', href: '#' },
      { title: 'Delivery partner login', href: '#' },
    ],
  },
  {
    label: 'Learn More',
    links: [
      { title: 'Privacy', href: '#' },
      { title: 'Security', href: '#' },
      { title: 'Terms of Service', href: '#' },
      { title: 'Help & Support', href: '#' },
      { title: 'Report a fraud', href: '#' },
      { title: 'Blog', href: '#' },
    ],
  },
];

type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
  children?: React.ReactNode;
  delay?: number;
};

function AnimatedContainer({
  delay = 0.1,
  children,
  ...props
}: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  // When reducing motion, render plain div with only HTML attributes (motion props are incompatible)
  if (shouldReduceMotion) {
    const { className, ...rest } = props
    return (
      <div className={className} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
