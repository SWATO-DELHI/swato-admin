// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Navigation, Clock, Phone, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'

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
  assigned: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  picked_up: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
}

// Default center (Delhi)
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 }

export function LiveDeliveriesMap({ deliveries: initialDeliveries }: LiveDeliveriesMapProps) {
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [isLive, setIsLive] = useState(false)
  const supabase = createClient()

  // API Key from env
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  useEffect(() => {
    setIsLive(true)

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
            .in('status', ['picked_up', 'assigned', 'ready', 'preparing'])
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

  const mapCenter = selectedDelivery?.driver?.current_lat && selectedDelivery?.driver?.current_lng
    ? { lat: selectedDelivery.driver.current_lat, lng: selectedDelivery.driver.current_lng }
    : DEFAULT_CENTER

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 p-0 overflow-hidden min-h-[500px] relative">
         <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-zinc-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-zinc-700">
            <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
            <span className="text-xs text-white font-medium">{isLive ? 'Live Updates' : 'Connecting...'}</span>
         </div>

         {!apiKey || apiKey === 'YOUR_API_KEY_HERE' ? (
             <div className="h-full w-full flex items-center justify-center flex-col text-zinc-500 p-8 text-center">
                 <MapPin className="h-12 w-12 mb-4 opacity-50" />
                 <h3 className="text-lg font-medium text-white mb-2">Google Maps API Key Missing</h3>
                 <p className="max-w-xs">Please add specific NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file to see the live map.</p>
             </div>
         ) : (
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={DEFAULT_CENTER}
                center={mapCenter}
                defaultZoom={11}
                zoom={selectedDelivery ? 14 : 11}
                mapId="DEMO_MAP_ID" // Simplified for now, user can create real Map ID
                className="w-full h-full"
                disableDefaultUI={true}
              >
                 {deliveries.map(delivery => {
                    // Driver Marker
                    if (delivery.driver?.current_lat && delivery.driver?.current_lng) {
                        return (
                            <AdvancedMarker
                                key={`driver-${delivery.driver.id}`}
                                position={{ lat: delivery.driver.current_lat, lng: delivery.driver.current_lng }}
                                onClick={() => setSelectedDelivery(delivery)}
                            >
                                <div className="text-2xl">🛵</div>
                            </AdvancedMarker>
                        )
                    }
                    return null
                 })}

                 {/* Show Restaurant and Customer for selected delivery */}
                 {selectedDelivery && selectedDelivery.restaurant?.lat && selectedDelivery.restaurant?.lng && (
                     <AdvancedMarker
                        position={{ lat: selectedDelivery.restaurant.lat, lng: selectedDelivery.restaurant.lng }}
                     >
                         <Pin background={'#10b981'} borderColor={'#064e3b'} glyphColor={'#ffffff'} />
                     </AdvancedMarker>
                 )}

                 {selectedDelivery && selectedDelivery.delivery_lat && selectedDelivery.delivery_lng && (
                     <AdvancedMarker
                        position={{ lat: selectedDelivery.delivery_lat, lng: selectedDelivery.delivery_lng }}
                     >
                         <Pin background={'#3b82f6'} borderColor={'#1e3a8a'} glyphColor={'#ffffff'} />
                     </AdvancedMarker>
                 )}
              </Map>
            </APIProvider>
         )}
      </Card>

      {/* Active Deliveries List */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b border-zinc-800 shrink-0">
          <h3 className="text-lg font-semibold text-white">Active Deliveries</h3>
          <p className="text-sm text-zinc-400">{deliveries.length} in progress</p>
        </div>

        <div className="divide-y divide-zinc-800 overflow-y-auto flex-1">
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
