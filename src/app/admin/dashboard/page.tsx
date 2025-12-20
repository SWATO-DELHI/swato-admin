import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/admin/dashboard/DashboardStats'
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart'
import { RecentOrders } from '@/components/admin/dashboard/RecentOrders'
import { LiveOrdersCard } from '@/components/admin/dashboard/LiveOrdersCard'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch dashboard stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { count: totalOrders },
    { count: todayOrders },
    { count: activeDrivers },
    { count: pendingOrders },
    { count: totalCustomers },
    { count: totalRestaurants },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('is_online', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed', 'preparing']),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }),
  ])

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(name, email),
      restaurant:restaurants!orders_restaurant_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  const stats = {
    totalOrders: totalOrders || 0,
    todayOrders: todayOrders || 0,
    activeDrivers: activeDrivers || 0,
    pendingOrders: pendingOrders || 0,
    totalCustomers: totalCustomers || 0,
    totalRestaurants: totalRestaurants || 0,
    revenue: 0, // Calculate from orders
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Welcome back! Here&apos;s what&apos;s happening with Swato today.</p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-80 bg-zinc-900 rounded-xl animate-pulse" />}>
            <RevenueChart />
          </Suspense>
        </div>
        <div>
          <LiveOrdersCard initialPendingOrders={pendingOrders || 0} />
        </div>
      </div>

      <RecentOrders orders={recentOrders || []} />
    </div>
  )
}
