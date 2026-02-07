// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Phone, Mail, Clock, IndianRupee, User, Store, Truck, XCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { OrderDetailActions } from '@/components/admin/orders/OrderDetailActions'
import { OrderTimeline } from '@/components/admin/orders/OrderTimeline'
import { notFound } from 'next/navigation'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(id, name, email, phone, avatar_url),
      restaurant:restaurants!orders_restaurant_id_fkey(id, name, logo_url, address, phone:owner_id),
      driver:drivers!orders_driver_id_fkey(
        id,
        current_lat,
        current_lng,
        vehicle_type,
        vehicle_number,
        user:users!drivers_user_id_fkey(name, phone)
      ),
      order_items(*),
      status_history:order_status_history(
        *,
        created_by_user:users(id, name)
      )
    `)
    .eq('id', id)
    .single()

  if (!order) {
    notFound()
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    preparing: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    ready: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    assigned: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    picked_up: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    delivered: 'bg-green-500/10 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-zinc-400 hover:text-white mb-2 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-white">Order {order.order_number}</h1>
          <p className="text-zinc-400 mt-1">View order details and manage status</p>
        </div>
        <OrderDetailActions order={order} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-white font-medium">₹{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Delivery Fee</span>
              <span className="text-white font-medium">₹{order.delivery_fee.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Discount</span>
                <span className="text-green-400 font-medium">-₹{order.discount.toLocaleString()}</span>
              </div>
            )}
            {order.tax && order.tax > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Tax</span>
                <span className="text-white font-medium">₹{order.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-white">₹{order.total.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400">Payment Status</span>
                <Badge className={`border capitalize ${
                  order.payment_status === 'paid'
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : order.payment_status === 'failed'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}>
                  {order.payment_status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Payment Method</span>
                <span className="text-white capitalize">{order.payment_method || 'N/A'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Customer Info */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Customer</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                {order.customer?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <p className="text-white font-medium">{order.customer?.name || 'Unknown'}</p>
                <p className="text-zinc-400 text-sm">{order.customer?.email}</p>
              </div>
            </div>
            {order.customer?.phone && (
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="h-4 w-4" />
                <a href={`tel:${order.customer.phone}`} className="hover:text-white transition-colors">
                  {order.customer.phone}
                </a>
              </div>
            )}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-zinc-400 text-sm mb-2">Delivery Address</p>
              <div className="flex items-start gap-2 text-zinc-300">
                <MapPin className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-sm">{order.delivery_address}</p>
                  {order.delivery_instructions && (
                    <p className="text-xs text-zinc-500 mt-1">Note: {order.delivery_instructions}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Restaurant & Driver Info */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Restaurant & Driver</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Store className="h-5 w-5 text-orange-400" />
                <Link
                  href={`/admin/restaurants/${order.restaurant_id}`}
                  className="text-white hover:text-orange-400 transition-colors"
                >
                  {order.restaurant?.name || 'Unknown'}
                </Link>
              </div>
              <p className="text-zinc-400 text-sm ml-8">{order.restaurant?.address}</p>
            </div>

            {order.driver ? (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="h-5 w-5 text-blue-400" />
                  <Link
                    href={`/admin/drivers/${order.driver.id}`}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {order.driver.user?.name || 'Unknown Driver'}
                  </Link>
                </div>
                <div className="text-zinc-400 text-sm ml-8 space-y-1">
                  <p>{order.driver.vehicle_type} - {order.driver.vehicle_number}</p>
                  {order.driver.user?.phone && (
                    <a href={`tel:${order.driver.user.phone}`} className="flex items-center gap-1 hover:text-white">
                      <Phone className="h-3 w-3" />
                      {order.driver.user.phone}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-800 rounded-lg">
                <p className="text-zinc-500 text-sm">No driver assigned</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">Order Items</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {order.order_items && order.order_items.length > 0 ? (
              order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.name}</p>
                    {item.notes && (
                      <p className="text-zinc-400 text-sm mt-1">Note: {item.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400">Qty: {item.quantity}</span>
                    <span className="text-white font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">No items found</p>
            )}
          </div>
        </div>
      </Card>

      {/* Order Timeline */}
      <OrderTimeline
        orderId={id}
        statusHistory={order.status_history || []}
        currentStatus={order.status}
      />
    </div>
  )
}
