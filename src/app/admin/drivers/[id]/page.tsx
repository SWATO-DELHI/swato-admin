import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Download, MapPin, Clock, Star, Truck, User, Phone, Mail, ArrowLeft, CheckCircle, XCircle, Pause, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { DriverDetailActions } from '@/components/admin/drivers/DriverDetailActions'
import { notFound } from 'next/navigation'

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: driver } = await supabase
    .from('drivers')
    .select(`
      *,
      user:users!drivers_user_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (!driver) {
    notFound()
  }

  const { data: pastDeliveries } = await supabase
    .from('orders')
    .select(`
      *,
      restaurant:restaurants!orders_restaurant_id_fkey(name, logo_url),
      customer:users!orders_customer_id_fkey(name, phone)
    `)
    .eq('driver_id', id)
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: locationHistory } = await supabase
    .from('driver_locations')
    .select('*')
    .eq('driver_id', id)
    .order('recorded_at', { ascending: false })
    .limit(50)

  // Calculate on-time delivery rate
  const deliveredOrders = pastDeliveries?.filter(o => o.status === 'delivered') || []
  const onTimeDeliveries = deliveredOrders.filter(order => {
    if (!order.estimated_delivery_time || !order.actual_delivery_time) return false
    return new Date(order.actual_delivery_time) <= new Date(order.estimated_delivery_time)
  })
  const onTimeRate = deliveredOrders.length > 0
    ? ((onTimeDeliveries.length / deliveredOrders.length) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/drivers"
            className="text-zinc-400 hover:text-white mb-2 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Drivers
          </Link>
          <h1 className="text-2xl font-bold text-white">{driver.user?.name || 'Driver Details'}</h1>
          <p className="text-zinc-400 mt-1">View and manage driver information, documents, and performance</p>
        </div>
        <DriverDetailActions driver={driver} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Info Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                {driver.user?.name?.charAt(0).toUpperCase() || 'D'}
              </div>
              <span
                className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-zinc-900 ${
                  driver.is_online ? 'bg-green-500' : 'bg-zinc-500'
                }`}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{driver.user?.name}</h2>
              <p className="text-zinc-400 text-sm">{driver.user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <Phone className="h-4 w-4" />
              <span>{driver.user?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Truck className="h-4 w-4" />
              <span className="capitalize">{driver.vehicle_type} - {driver.vehicle_number}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>{driver.rating?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <MapPin className="h-4 w-4" />
              <span>{driver.total_deliveries || 0} deliveries</span>
            </div>
            {driver.on_hold && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm font-medium">On Hold</p>
                {driver.hold_reason && (
                  <p className="text-zinc-400 text-xs mt-1">{driver.hold_reason}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400">Total Earnings</span>
              <span className="text-xl font-bold text-white">₹{(driver.total_earnings || 0).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Documents Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Documents</h3>
          <div className="space-y-4">
            <div>
              <p className="text-zinc-400 text-sm mb-1">License Number</p>
              <p className="text-white font-mono text-sm">{driver.license_number}</p>
            </div>

            {driver.license_url ? (
              <div>
                <p className="text-zinc-400 text-sm mb-2">License Document</p>
                <a
                  href={driver.license_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">View License</span>
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="p-3 bg-zinc-800 rounded-lg">
                <p className="text-zinc-500 text-sm">License document not uploaded</p>
              </div>
            )}

            {driver.rc_url ? (
              <div>
                <p className="text-zinc-400 text-sm mb-2">RC Document</p>
                <a
                  href={driver.rc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">View RC</span>
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="p-3 bg-zinc-800 rounded-lg">
                <p className="text-zinc-500 text-sm">RC document not uploaded</p>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800">
              <Badge className={`border ${
                driver.is_verified
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}>
                {driver.is_verified ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Pending Verification
                  </>
                )}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Stats Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <p className="text-zinc-400 text-sm">Total Deliveries</p>
              <p className="text-2xl font-bold text-white">{driver.total_deliveries || 0}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Average Rating</p>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <p className="text-2xl font-bold text-white">{driver.rating?.toFixed(1) || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">On-Time Delivery Rate</p>
              <p className="text-2xl font-bold text-white">{onTimeRate}%</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Status</p>
              <Badge className={`border mt-1 ${
                driver.is_online
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
              }`}>
                {driver.is_online ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for Past Deliveries and Location History */}
      <Tabs defaultValue="deliveries" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="deliveries">Past Deliveries</TabsTrigger>
          <TabsTrigger value="locations">Location History</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Delivery History</h3>
              <p className="text-sm text-zinc-400 mt-1">Last {pastDeliveries?.length || 0} deliveries</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Order</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Restaurant</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {pastDeliveries && pastDeliveries.length > 0 ? (
                    pastDeliveries.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-orange-400 hover:text-orange-300 font-mono text-sm"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-zinc-300">{order.restaurant?.name || 'Unknown'}</td>
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
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                        No deliveries yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Location History</h3>
              <p className="text-sm text-zinc-400 mt-1">Recent location updates</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Coordinates</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Order</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {locationHistory && locationHistory.length > 0 ? (
                    locationHistory.map((location) => (
                      <tr key={location.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <MapPin className="h-4 w-4" />
                            <span className="font-mono text-sm">
                              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {location.order_id ? (
                            <Link
                              href={`/admin/orders/${location.order_id}`}
                              className="text-orange-400 hover:text-orange-300 text-sm"
                            >
                              View Order
                            </Link>
                          ) : (
                            <span className="text-zinc-500 text-sm">No order</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-sm">
                          {formatDistanceToNow(new Date(location.recorded_at), { addSuffix: true })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                        No location history
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
