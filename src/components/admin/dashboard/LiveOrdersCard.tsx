'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Activity, TrendingUp } from 'lucide-react'

interface LiveOrdersCardProps {
  initialPendingOrders: number
}

export function LiveOrdersCard({ initialPendingOrders }: LiveOrdersCardProps) {
  const [pendingOrders, setPendingOrders] = useState(initialPendingOrders)
  const [isLive, setIsLive] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setIsLive(true)

    // Subscribe to real-time order updates
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async () => {
          // Refetch pending orders count
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'confirmed', 'preparing'])

          if (count !== null) {
            setPendingOrders(count)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Live Orders</h3>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
          <span className="text-xs text-zinc-400">{isLive ? 'Live' : 'Connecting...'}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Active Orders</p>
              <p className="text-3xl font-bold text-white">{pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Order Rate</p>
              <p className="text-lg font-semibold text-white">+12% <span className="text-xs text-zinc-500">vs yesterday</span></p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            Real-time updates via WebSocket
          </p>
        </div>
      </div>
    </Card>
  )
}
