import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, MapPin, Phone, Mail, Clock, IndianRupee, ArrowLeft, Store, ShoppingBag, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { RestaurantDetailActions } from '@/components/admin/restaurants/RestaurantDetailActions'
import { RestaurantMenu } from '@/components/admin/restaurants/RestaurantMenu'
import { notFound } from 'next/navigation'

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select(`
      *,
      owner:users!restaurants_owner_id_fkey(id, name, email, phone)
    `)
    .eq('id', id)
    .single()

  if (!restaurant) {
    notFound()
  }

  // Fetch restaurant orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(name)
    `)
    .eq('restaurant_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Calculate statistics
  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
  const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Fetch menu categories and items
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', id)
    .order('sort_order')

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/restaurants"
            className="text-zinc-400 hover:text-white mb-2 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Restaurants
          </Link>
          <h1 className="text-2xl font-bold text-white">{restaurant.name}</h1>
          <p className="text-zinc-400 mt-1">Manage restaurant details, menu, and orders</p>
        </div>
        <RestaurantDetailActions restaurant={restaurant} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Restaurant Info Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl font-bold text-white">
              {restaurant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{restaurant.name}</h2>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-zinc-400 text-sm">{restaurant.rating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{restaurant.address}</span>
            </div>
            {restaurant.owner && (
              <>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{restaurant.owner.email}</span>
                </div>
                {restaurant.owner.phone && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{restaurant.owner.phone}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-2 text-zinc-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {restaurant.opening_time} - {restaurant.closing_time}
              </span>
            </div>
            {restaurant.is_blocked && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-medium">Blocked</p>
                {restaurant.blocked_reason && (
                  <p className="text-zinc-400 text-xs mt-1">{restaurant.blocked_reason}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400">Commission Rate</span>
              <span className="text-xl font-bold text-white">{restaurant.commission_rate}%</span>
            </div>
          </div>
        </Card>

        {/* Statistics Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-zinc-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Completed Orders</p>
              <p className="text-2xl font-bold text-white">{completedOrders}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-white">₹{avgOrderValue.toFixed(0)}</p>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
          <div className="space-y-3">
            <div>
              <p className="text-zinc-400 text-sm mb-2">Verification</p>
              <Badge className={`border ${
                restaurant.is_verified
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}>
                {restaurant.is_verified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <div>
              <p className="text-zinc-400 text-sm mb-2">Active Status</p>
              <Badge className={`border ${
                restaurant.is_active
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
              }`}>
                {restaurant.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {restaurant.review_notes && (
              <div>
                <p className="text-zinc-400 text-sm mb-2">Review Notes</p>
                <p className="text-zinc-300 text-sm bg-zinc-800 p-3 rounded-lg">{restaurant.review_notes}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tabs for Menu and Orders */}
      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="mt-4">
          <RestaurantMenu
            restaurantId={id}
            categories={categories || []}
            menuItems={menuItems || []}
          />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Order History</h3>
              <p className="text-sm text-zinc-400 mt-1">Recent orders from this restaurant</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Order</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-orange-400 hover:text-orange-300 font-mono text-sm"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-zinc-300">{order.customer?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-white font-medium">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge className={`border capitalize ${
                            order.status === 'delivered'
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-sm">
                          {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
