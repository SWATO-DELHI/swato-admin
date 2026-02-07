'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { XCircle, Truck } from 'lucide-react'

interface Order {
  id: string
  status: string
  driver_id: string | null
}

interface OrderDetailActionsProps {
  order: Order
}

const orderStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'delivered', label: 'Delivered' },
]

export function OrderDetailActions({ order }: OrderDetailActionsProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function updateOrderStatus(newStatus: string) {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        ...(newStatus === 'delivered' && { actual_delivery_time: new Date().toISOString() }),
      })
      .eq('id', order.id)

    if (error) {
      toast.error('Failed to update order status')
      setIsLoading(false)
      return
    }

    // Add to status history
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: newStatus,
      created_by: user?.id,
    })

    toast.success('Order status updated')
    router.refresh()
    setIsLoading(false)
  }

  async function cancelOrder() {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_by: 'admin',
        cancellation_reason: cancelReason,
      })
      .eq('id', order.id)

    if (error) {
      toast.error('Failed to cancel order')
      setIsLoading(false)
      return
    }

    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'cancelled',
      notes: cancelReason,
      created_by: user?.id,
    })

    toast.success('Order cancelled')
    setCancelDialogOpen(false)
    setCancelReason('')
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="flex gap-2">
      <Select value={selectedStatus} onValueChange={(value) => {
        setSelectedStatus(value)
        updateOrderStatus(value)
      }} disabled={isLoading || order.status === 'cancelled' || order.status === 'delivered'}>
        <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          {orderStatuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {order.status !== 'cancelled' && order.status !== 'delivered' && (
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Cancel Order</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This will cancel the order. Please provide a reason.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Cancellation Reason</Label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[100px] resize-none"
                  required
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={cancelOrder}
                className="bg-red-600 hover:bg-red-700"
                disabled={!cancelReason.trim()}
              >
                Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
