'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { OrdersTable } from './OrdersTable'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RefreshCw, Bell, BellOff, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total: number
  created_at: string
  customer: { name: string; phone: string } | null
  restaurant: { id: string; name: string; logo_url: string | null } | null
  driver: { id: string; user_id: string } | null
}

interface RealTimeOrdersWrapperProps {
  initialOrders: Order[]
}

const statusLabels: Record<string, string> = {
  pending: 'New Order',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  assigned: 'Driver Assigned',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function RealTimeOrdersWrapper({ initialOrders }: RealTimeOrdersWrapperProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isLive, setIsLive] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const orderIdsRef = useRef(new Set(initialOrders.map(o => o.id)))

  // Play notification sound for new orders
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return
    try {
      // Use Web Audio API for a simple beep
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.2)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator()
        osc2.connect(gainNode)
        osc2.frequency.value = 1000
        osc2.type = 'sine'
        osc2.start()
        osc2.stop(audioCtx.currentTime + 0.3)
      }, 250)
    } catch {
      // Audio not available
    }
  }, [soundEnabled])

  // Full refresh from database
  const refreshOrders = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:users!orders_customer_id_fkey(id, name, email, phone),
          restaurant:restaurants!orders_restaurant_id_fkey(id, name, logo_url),
          driver:drivers!orders_driver_id_fkey(id, user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error refreshing orders:', error)
        toast.error('Failed to refresh orders')
        return
      }

      if (data) {
        setOrders(data as unknown as Order[])
        orderIdsRef.current = new Set(data.map((o: any) => o.id))
        setLastRefresh(new Date())
        setNewOrderCount(0)
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [supabase])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('📡 New order received:', payload.new)
          const newOrder = payload.new as any

          // Check if this is truly a new order we haven't seen
          if (!orderIdsRef.current.has(newOrder.id)) {
            orderIdsRef.current.add(newOrder.id)
            setNewOrderCount(prev => prev + 1)
            playNotificationSound()
            toast.info(`New order ${newOrder.order_number || 'received'}!`, {
              duration: 5000,
              action: {
                label: 'Refresh',
                onClick: refreshOrders,
              },
            })
          }

          // Auto-refresh to get full joined data
          refreshOrders()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updatedOrder = payload.new as any
          console.log('📡 Order updated:', updatedOrder.id, updatedOrder.status)

          // Update in-place for status changes
          setOrders(prev =>
            prev.map(order => {
              if (order.id === updatedOrder.id) {
                return { ...order, ...updatedOrder }
              }
              return order
            })
          )

          // Show toast for important status changes
          if (['ready', 'cancelled'].includes(updatedOrder.status)) {
            const label = statusLabels[updatedOrder.status] || updatedOrder.status
            toast.info(`Order ${updatedOrder.order_number}: ${label}`, { duration: 3000 })
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          const deletedId = (payload.old as any).id
          setOrders(prev => prev.filter(o => o.id !== deletedId))
          orderIdsRef.current.delete(deletedId)
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') {
          console.log('✅ Admin orders real-time connected')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, playNotificationSound, refreshOrders])

  // Auto-refresh every 30 seconds as fallback
  useEffect(() => {
    const interval = setInterval(refreshOrders, 30000)
    return () => clearInterval(interval)
  }, [refreshOrders])

  return (
    <div className="space-y-4">
      {/* Real-time Status Bar */}
      <Card className="bg-zinc-900 border-zinc-800 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isLive ? (
                <>
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">Live</span>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-500">Connecting...</span>
                </>
              )}
            </div>

            {/* Order Stats Quick View */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <span>{orders.length} orders</span>
              <span>•</span>
              <span>{orders.filter(o => o.status === 'pending').length} pending</span>
              <span>•</span>
              <span>{orders.filter(o => ['preparing', 'ready'].includes(o.status)).length} active</span>
            </div>

            {/* New Order Alert */}
            {newOrderCount > 0 && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 border animate-pulse cursor-pointer" onClick={refreshOrders}>
                {newOrderCount} new order{newOrderCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
            >
              {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>

            {/* Last Refresh Time */}
            <span className="text-xs text-zinc-500 hidden sm:inline">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>

            {/* Manual Refresh */}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white h-8 w-8"
              onClick={refreshOrders}
              disabled={isRefreshing}
              title="Refresh orders"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <OrdersTable orders={orders as any} />
    </div>
  )
}
