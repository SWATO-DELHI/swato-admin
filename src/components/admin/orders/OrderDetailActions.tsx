'use client'

import { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { XCircle, Truck, UserPlus, MapPin, Star, Phone } from 'lucide-react'

interface Order {
  id: string
  status: string
  driver_id: string | null
  restaurant_id: string
}

interface AvailableDriver {
  id: string
  user_id: string
  vehicle_type: string
  vehicle_number: string
  rating: number
  total_deliveries: number
  is_online: boolean
  current_lat: number | null
  current_lng: number | null
  user: { name: string; phone: string } | null
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
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  // Fetch available drivers when assign dialog opens
  useEffect(() => {
    if (!assignDialogOpen) return

    async function fetchDrivers() {
      setLoadingDrivers(true)
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select(`
            id,
            user_id,
            vehicle_type,
            vehicle_number,
            rating,
            total_deliveries,
            is_online,
            current_lat,
            current_lng,
            user:users!drivers_user_id_fkey(name, phone)
          `)
          .eq('is_verified', true)
          .is('current_order_id', null)
          .order('rating', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Error fetching drivers:', error)
          // Fallback: fetch all verified drivers
          const { data: fallback } = await supabase
            .from('drivers')
            .select(`
              id,
              user_id,
              vehicle_type,
              vehicle_number,
              rating,
              total_deliveries,
              is_online,
              current_lat,
              current_lng,
              user:users!drivers_user_id_fkey(name, phone)
            `)
            .eq('is_verified', true)
            .order('rating', { ascending: false })
            .limit(20)

          setAvailableDrivers((fallback || []) as unknown as AvailableDriver[])
        } else {
          setAvailableDrivers((data || []) as unknown as AvailableDriver[])
        }
      } finally {
        setLoadingDrivers(false)
      }
    }

    fetchDrivers()
  }, [assignDialogOpen, supabase])

  async function assignDriver() {
    if (!selectedDriverId) {
      toast.error('Please select a driver')
      return
    }

    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Try RPC first for race-condition safety
    const { error: rpcError } = await (supabase.rpc as any)('accept_delivery', {
      p_order_id: order.id,
      p_driver_id: selectedDriverId,
    })

    if (rpcError) {
      console.warn('RPC assign failed, using direct update:', rpcError)
      // Fallback to direct update
      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: selectedDriverId,
          status: 'assigned',
          driver_assigned_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      if (error) {
        toast.error('Failed to assign driver')
        setIsLoading(false)
        return
      }

      // Update driver's current order
      await supabase
        .from('drivers')
        .update({ current_order_id: order.id } as any)
        .eq('id', selectedDriverId)
    }

    // Log the assignment
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'assigned',
      notes: 'Driver manually assigned by admin',
      created_by: user?.id,
    })

    toast.success('Driver assigned successfully')
    setAssignDialogOpen(false)
    setSelectedDriverId(null)
    router.refresh()
    setIsLoading(false)
  }

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
    <div className="flex gap-2 flex-wrap">
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

      {/* Assign Driver Button - show when order needs a driver */}
      {['ready', 'confirmed', 'preparing'].includes(order.status) && !order.driver_id && (
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-white">Assign Driver</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Manually assign a verified driver to this order.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-2 py-4 min-h-0">
              {loadingDrivers ? (
                <div className="text-center py-8 text-zinc-500">
                  <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
                  Loading available drivers...
                </div>
              ) : availableDrivers.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Truck className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No available drivers found</p>
                  <p className="text-xs mt-1">All verified drivers are currently on deliveries</p>
                </div>
              ) : (
                availableDrivers.map((driver) => (
                  <Card
                    key={driver.id}
                    className={`p-3 cursor-pointer transition-all border ${
                      selectedDriverId === driver.id
                        ? 'bg-blue-500/10 border-blue-500/50'
                        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                    }`}
                    onClick={() => setSelectedDriverId(driver.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                          driver.is_online ? 'bg-green-600' : 'bg-zinc-600'
                        }`}>
                          {driver.user?.name?.charAt(0).toUpperCase() || 'D'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {driver.user?.name || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span>{driver.vehicle_type} • {driver.vehicle_number}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-white">{driver.rating?.toFixed(1) || '—'}</span>
                        </div>
                        <p className="text-xs text-zinc-500">{driver.total_deliveries} deliveries</p>
                        <Badge className={`text-xs mt-1 border ${
                          driver.is_online
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                        }`}>
                          {driver.is_online ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>

                    {driver.user?.phone && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                        <Phone className="h-3 w-3" />
                        {driver.user.phone}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-zinc-800">
              <Button
                variant="ghost"
                onClick={() => setAssignDialogOpen(false)}
                className="text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                onClick={assignDriver}
                disabled={!selectedDriverId || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Assigning...' : 'Assign Driver'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
