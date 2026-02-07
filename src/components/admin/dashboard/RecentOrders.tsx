import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  customer: { name: string; email: string } | null
  restaurant: { name: string } | null
}

interface RecentOrdersProps {
  orders: Order[]
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

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <div className="flex items-center justify-between p-6 border-b border-zinc-800">
        <div>
          <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
          <p className="text-sm text-zinc-400">Latest orders across all restaurants</p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Order
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Customer
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Restaurant
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Total
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-white hover:text-orange-400 transition-colors"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-white">{order.customer?.name || 'Unknown'}</p>
                      <p className="text-xs text-zinc-500">{order.customer?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {order.restaurant?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${statusColors[order.status]} border capitalize`}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    ₹{order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
