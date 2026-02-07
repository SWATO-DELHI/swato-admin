// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { RealTimeOrdersWrapper } from '@/components/admin/orders/RealTimeOrdersWrapper'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(id, name, email, phone),
      restaurant:restaurants!orders_restaurant_id_fkey(id, name, logo_url),
      driver:drivers!orders_driver_id_fkey(id, user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-zinc-400 mt-1">Manage and track all orders in real-time</p>
      </div>

      <RealTimeOrdersWrapper initialOrders={(orders || []) as any} />
    </div>
  )
}
