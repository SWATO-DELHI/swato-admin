// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { LiveDeliveriesMap } from '@/components/admin/deliveries/LiveDeliveriesMap'

export default async function DeliveriesPage() {
  const supabase = await createClient()

  // Fetch active orders with drivers
  const { data: activeDeliveries } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(name, phone),
      restaurant:restaurants!orders_restaurant_id_fkey(name, address, lat, lng),
      driver:drivers!orders_driver_id_fkey(
        id,
        current_lat,
        current_lng,
        vehicle_type,
        user:users!drivers_user_id_fkey(name, phone)
      )
    `)
    .in('status', ['picked', 'ready', 'preparing'])
    .not('driver_id', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Live Deliveries</h1>
        <p className="text-zinc-400 mt-1">Track active deliveries in real-time</p>
      </div>

      <LiveDeliveriesMap deliveries={activeDeliveries || []} />
    </div>
  )
}
