'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Clock, CheckCircle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface StatusHistory {
  id: string
  status: string
  notes: string | null
  created_at: string
  created_by_user: { name: string } | null
}

interface OrderTimelineProps {
  orderId: string
  statusHistory: StatusHistory[]
  currentStatus: string
}

const statusLabels: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Order Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function OrderTimeline({ orderId, statusHistory: initialHistory, currentStatus }: OrderTimelineProps) {
  const [statusHistory, setStatusHistory] = useState(initialHistory)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to real-time status updates
    const channel = supabase
      .channel(`order-${orderId}-timeline`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_status_history',
          filter: `order_id=eq.${orderId}`,
        },
        async () => {
          // Refetch status history
          const { data } = await supabase
            .from('order_status_history')
            .select(`
              *,
              created_by_user:users(id, name)
            `)
            .eq('order_id', orderId)
            .order('created_at', { ascending: false })

          if (data) setStatusHistory(data)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  const sortedHistory = [...statusHistory].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-lg font-semibold text-white">Order Timeline</h3>
        <p className="text-sm text-zinc-400 mt-1">Track order status changes</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {sortedHistory.length > 0 ? (
            sortedHistory.map((history, index) => (
              <div key={history.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    index === sortedHistory.length - 1
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }`}>
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  {index < sortedHistory.length - 1 && (
                    <div className="w-0.5 h-full bg-zinc-700 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="border bg-blue-500/10 text-blue-400 border-blue-500/30 capitalize">
                      {statusLabels[history.status] || history.status}
                    </Badge>
                    <span className="text-zinc-500 text-sm">
                      {formatDistanceToNow(new Date(history.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {history.notes && (
                    <p className="text-zinc-400 text-sm mt-1">{history.notes}</p>
                  )}
                  {history.created_by_user && (
                    <p className="text-zinc-500 text-xs mt-1">
                      by {history.created_by_user.name}
                    </p>
                  )}
                  <p className="text-zinc-600 text-xs mt-1">
                    {format(new Date(history.created_at), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
              <p>No status history available</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
