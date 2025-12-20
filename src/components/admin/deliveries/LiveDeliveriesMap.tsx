'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Navigation, Clock, Phone, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Delivery {
  id: string
  order_number: string
  status: string
  delivery_address: string
  delivery_lat: number | null
  delivery_lng: number | null
  created_at: string
  customer: { name: string; phone: string | null } | null
  restaurant: { name: string; address: string; lat: number | null; lng: number | null } | null
  driver: {
    id: string
    current_lat: number | null
    current_lng: number | null
    vehicle_type: string
    user: { name: string; phone: string | null } | null
  } | null
}

interface LiveDeliveriesMapProps {
  deliveries: Delivery[]
}

const statusColors: Record<string, string> = {
  preparing: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  ready: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  picked: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
}

export function LiveDeliveriesMap({ deliveries: initialDeliveries }: LiveDeliveriesMapProps) {
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [isLive, setIsLive] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setIsLive(true)

    // Subscribe to real-time driver location updates
    const channel = supabase
      .channel('driver-locations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedDriver = payload.new as { id: string; current_lat: number; current_lng: number }
            setDeliveries(prev =>
              prev.map(d => {
                if (d.driver?.id === updatedDriver.id) {
                  return {
                    ...d,
                    driver: {
                      ...d.driver,
                      current_lat: updatedDriver.current_lat,
                      current_lng: updatedDriver.current_lng,
                    },
                  }
                }
                return d
              })
            )
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        async () => {
          // Refetch deliveries when order status changes
          const { data } = await supabase
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

          if (data) setDeliveries(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map placeholder - integrate with Mapbox/Google Maps */}
      <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 p-6 min-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Live Map</h3>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
            <span className="text-xs text-zinc-400">{isLive ? 'Live Updates' : 'Connecting...'}</span>
          </div>
        </div>

        <div className="h-full min-h-[400px] bg-zinc-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">
              Map integration required
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              Add Mapbox or Google Maps API key to enable live tracking
            </p>
            <div className="mt-4 p-4 bg-zinc-900 rounded-lg text-left max-w-md mx-auto">
              <p className="text-zinc-400 text-xs font-mono">
                Active Drivers: {deliveries.filter(d => d.driver?.current_lat).length}
              </p>
              {deliveries.slice(0, 3).map(d => (
                <p key={d.id} className="text-zinc-500 text-xs font-mono mt-1">
                  {d.driver?.user?.name}: ({d.driver?.current_lat?.toFixed(4)}, {d.driver?.current_lng?.toFixed(4)})
                </p>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Active Deliveries List */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">Active Deliveries</h3>
          <p className="text-sm text-zinc-400">{deliveries.length} in progress</p>
        </div>

        <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
          {deliveries.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              No active deliveries
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div
                key={delivery.id}
                onClick={() => setSelectedDelivery(delivery)}
                className={`p-4 cursor-pointer transition-colors hover:bg-zinc-800/50 ${
                  selectedDelivery?.id === delivery.id ? 'bg-zinc-800/50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{delivery.order_number}</span>
                  <Badge className={`${statusColors[delivery.status]} border capitalize text-xs`}>
                    {delivery.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User className="h-3 w-3" />
                    <span>{delivery.driver?.user?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Navigation className="h-3 w-3" />
                    <span className="truncate">{delivery.restaurant?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{delivery.delivery_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                {delivery.driver?.user?.phone && (
                  <a
                    href={`tel:${delivery.driver.user.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300"
                  >
                    <Phone className="h-3 w-3" />
                    Call Driver
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
