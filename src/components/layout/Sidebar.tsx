'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';
import {
  LayoutDashboard,
  ShoppingCart,
  Store,
  Users,
  Truck,
  Menu,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Orders', href: ROUTES.ORDERS, icon: ShoppingCart },
  { name: 'Restaurants', href: ROUTES.RESTAURANTS, icon: Store },
  { name: 'Customers', href: ROUTES.CUSTOMERS, icon: Users },
  { name: 'Drivers', href: ROUTES.DRIVERS, icon: Truck },
  { name: 'Menu', href: ROUTES.MENU, icon: Menu },
  { name: 'Analytics', href: ROUTES.ANALYTICS, icon: BarChart3 },
  { name: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 rounded-md bg-white p-2 shadow-lg"
        >
          <Menu className="h-6 w-6" />
        </button>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            <div className="relative flex w-full max-w-xs flex-col bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <SidebarContent pathname={pathname} onLinkClick={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-white border-r border-gray-200">
          <SidebarContent pathname={pathname} />
        </div>
      </div>
    </>
  );
}

interface SidebarContentProps {
  pathname: string;
  onLinkClick?: () => void;
}

function SidebarContent({ pathname, onLinkClick }: SidebarContentProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-shrink-0 items-center px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900">Swato Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 pb-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}











