import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Phone, Mail, MapPin, ShoppingBag, IndianRupee, TrendingUp, Ban, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { CustomerDetailActions } from '@/components/admin/customers/CustomerDetailActions'
import { notFound } from 'next/navigation'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('role', 'customer')
    .single()

  if (!customer) {
    notFound()
  }

  // Fetch customer orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      restaurant:restaurants!orders_restaurant_id_fkey(name, logo_url)
    `)
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  // Fetch support tickets
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate statistics
  const totalOrders = orders?.length || 0
  const totalSpent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
  const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/customers"
            className="text-zinc-400 hover:text-white mb-2 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Link>
          <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
          <p className="text-zinc-400 mt-1">View customer profile and activity</p>
        </div>
        <CustomerDetailActions customer={customer} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Customer Info Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl font-bold text-white">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{customer.name}</h2>
              <Badge className={`border mt-1 ${
                customer.status === 'active'
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {customer.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-300">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="h-4 w-4" />
                <a href={`tel:${customer.phone}`} className="hover:text-white transition-colors text-sm">
                  {customer.phone}
                </a>
              </div>
            )}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-zinc-400 text-xs">Member Since</p>
              <p className="text-zinc-300 text-sm mt-1">
                {format(new Date(customer.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-zinc-400 text-xs">Completed</p>
            <p className="text-white text-lg font-semibold mt-1">{completedOrders}</p>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-white">₹{totalSpent.toLocaleString()}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-zinc-400 text-xs">Avg Order</p>
            <p className="text-white text-lg font-semibold mt-1">₹{avgOrderValue.toFixed(0)}</p>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-zinc-400 text-xs">Cancelled</p>
            <p className="text-white text-lg font-semibold mt-1">{cancelledOrders}</p>
          </div>
        </Card>
      </div>

      {/* Tabs for Orders and Support */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Order History</h3>
              <p className="text-sm text-zinc-400 mt-1">All orders placed by this customer</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Order</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-6 py-3">Restaurant</th>
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
                        <td className="px-6 py-4 text-zinc-300">{order.restaurant?.name || 'Unknown'}</td>
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

        <TabsContent value="support" className="mt-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Support Tickets</h3>
              <p className="text-sm text-zinc-400 mt-1">Customer support history</p>
            </div>
            <div className="p-6 space-y-4">
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-zinc-500">{ticket.ticket_number}</span>
                          <Badge className={`border capitalize ${
                            ticket.status === 'resolved'
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : ticket.status === 'closed'
                              ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="text-white font-medium">{ticket.subject}</h4>
                        <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{ticket.description}</p>
                        <p className="text-zinc-500 text-xs mt-2">
                          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <p>No support tickets</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
