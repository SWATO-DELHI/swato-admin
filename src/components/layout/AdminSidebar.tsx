'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Truck,
  MapPin,
  Bell,
  Tag,
  Wallet,
  BarChart3,
  Settings,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Restaurants', href: '/admin/restaurants', icon: Store },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Drivers', href: '/admin/drivers', icon: Truck },
  { name: 'Live Deliveries', href: '/admin/deliveries', icon: MapPin },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Promotions', href: '/admin/promotions', icon: Tag },
  { name: 'Finance', href: '/admin/finance', icon: Wallet },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Support', href: '/admin/support', icon: HeadphonesIcon },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a static version during SSR
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-background dark:bg-zinc-950 border-r border-border dark:border-zinc-800">
        <div className="flex h-16 items-center justify-between px-4 border-b border-border dark:border-zinc-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Swato Admin</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-zinc-800/50"
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-background dark:bg-zinc-950 border-r border-border dark:border-zinc-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border dark:border-zinc-800">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Swato Admin</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-secondary dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"
          suppressHydrationWarning
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-zinc-800/50'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={20} className={cn(isActive && 'text-orange-400')} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
