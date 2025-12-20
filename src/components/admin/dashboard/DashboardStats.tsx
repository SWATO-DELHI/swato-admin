import { Card } from '@/components/ui/card'
import {
  ShoppingBag,
  TrendingUp,
  Truck,
  Clock,
  Users,
  Store,
  IndianRupee
} from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalOrders: number
    todayOrders: number
    activeDrivers: number
    pendingOrders: number
    totalCustomers: number
    totalRestaurants: number
    revenue: number
  }
}

const statCards = [
  {
    title: "Today's Orders",
    key: 'todayOrders' as const,
    icon: ShoppingBag,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
  },
  {
    title: 'Revenue',
    key: 'revenue' as const,
    icon: IndianRupee,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
    prefix: '₹',
  },
  {
    title: 'Active Drivers',
    key: 'activeDrivers' as const,
    icon: Truck,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    title: 'Pending Orders',
    key: 'pendingOrders' as const,
    icon: Clock,
    gradient: 'from-amber-500 to-yellow-500',
    bgGradient: 'from-amber-500/10 to-yellow-500/10',
  },
  {
    title: 'Total Customers',
    key: 'totalCustomers' as const,
    icon: Users,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
  },
  {
    title: 'Restaurants',
    key: 'totalRestaurants' as const,
    icon: Store,
    gradient: 'from-rose-500 to-orange-500',
    bgGradient: 'from-rose-500/10 to-orange-500/10',
  },
]

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((card) => (
        <Card
          key={card.key}
          className={`bg-gradient-to-br ${card.bgGradient} border-zinc-800 p-4 hover:border-zinc-700 transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-1">
                {card.prefix || ''}{stats[card.key].toLocaleString()}
              </p>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient}`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
