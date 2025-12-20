'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Star, Bike, Car, Plus, Pause, Trash2, Eye, Play } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Driver {
  id: string
  user_id: string
  vehicle_type: string
  vehicle_number: string
  is_verified: boolean | null
  is_online: boolean | null
  on_hold: boolean | null
  rating: number | null
  total_deliveries: number | null
  total_earnings: number | null
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    avatar_url: string | null
  } | null
}

interface DriversTableProps {
  drivers: Driver[]
}

const vehicleIcons: Record<string, typeof Bike> = {
  bike: Bike,
  scooter: Bike,
  car: Car,
  bicycle: Bike,
}

export function DriversTable({ drivers: initialDrivers }: DriversTableProps) {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [holdDialogOpen, setHoldDialogOpen] = useState<string | null>(null)
  const [addDriverDialogOpen, setAddDriverDialogOpen] = useState(false)
  const [holdReason, setHoldReason] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'online' && driver.is_online) ||
      (statusFilter === 'offline' && !driver.is_online) ||
      (statusFilter === 'verified' && driver.is_verified) ||
      (statusFilter === 'pending' && !driver.is_verified) ||
      (statusFilter === 'on_hold' && driver.on_hold)

    return matchesSearch && matchesStatus
  })

  async function updateDriverStatus(id: string, is_verified: boolean) {
    const { error } = await supabase
      .from('drivers')
      .update({ is_verified })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update driver')
      return
    }

    setDrivers(drivers.map(d =>
      d.id === id ? { ...d, is_verified } : d
    ))
    toast.success(`Driver ${is_verified ? 'verified' : 'rejected'} successfully`)
  }

  async function deleteDriver(id: string) {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete driver')
      return
    }

    setDrivers(drivers.filter(d => d.id !== id))
    toast.success('Driver deleted successfully')
    setDeleteDialogOpen(null)
  }

  async function putDriverOnHold(id: string, hold: boolean) {
    const { error } = await supabase
      .from('drivers')
      .update({
        on_hold: hold,
        hold_reason: hold ? holdReason : null,
        hold_started_at: hold ? new Date().toISOString() : null,
        hold_ended_at: hold ? null : new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update driver status')
      return
    }

    setDrivers(drivers.map(d =>
      d.id === id ? { ...d, on_hold: hold } : d
    ))
    toast.success(`Driver ${hold ? 'put on hold' : 'removed from hold'}`)
    setHoldDialogOpen(null)
    setHoldReason('')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Delivery Partners</h2>
        <Dialog open={addDriverDialogOpen} onOpenChange={setAddDriverDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Driver</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Create a new delivery partner account. The user must already exist in the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">User Email</Label>
                <Input
                  placeholder="driver@example.com"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Vehicle Type</Label>
                <Select>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="bicycle">Bicycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Vehicle Number</Label>
                <Input
                  placeholder="DL-01-AB-1234"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">License Number</Label>
                <Input
                  placeholder="DL1234567890"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddDriverDialogOpen(false)}
                className="border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  toast.info('Driver creation functionality - link to user creation API')
                  setAddDriverDialogOpen(false)
                }}
              >
                Add Driver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    <Card className="bg-zinc-900 border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name, email or vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Driver
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Vehicle
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Rating
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Deliveries
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Earnings
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                  No drivers found
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => {
                const VehicleIcon = vehicleIcons[driver.vehicle_type] || Bike
                return (
                  <tr key={driver.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={driver.user?.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                              {driver.user?.name.charAt(0).toUpperCase() || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900 ${
                              driver.is_online ? 'bg-green-500' : 'bg-zinc-500'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{driver.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-zinc-500">{driver.user?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <VehicleIcon className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="text-sm text-white capitalize">{driver.vehicle_type}</p>
                          <p className="text-xs text-zinc-500">{driver.vehicle_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-white">{driver.rating?.toFixed(1) || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {driver.total_deliveries || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      ₹{(driver.total_earnings || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Badge
                          className={`border ${
                            driver.is_online
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                          }`}
                        >
                          {driver.is_online ? 'Online' : 'Offline'}
                        </Badge>
                        <Badge
                          className={`border ${
                            driver.is_verified
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {driver.is_verified ? 'Verified' : 'Pending'}
                        </Badge>
                        {driver.on_hold && (
                          <Badge className="border bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                            On Hold
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/drivers/${driver.id}`} className="flex items-center cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details & Documents
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-700" />
                          {!driver.is_verified && (
                            <>
                              <DropdownMenuItem
                                onClick={() => updateDriverStatus(driver.id, true)}
                                className="cursor-pointer"
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                                <span className="text-green-400">Verify Driver</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-zinc-700" />
                            </>
                          )}
                          {driver.is_verified && (
                            <DropdownMenuItem
                              onClick={() => updateDriverStatus(driver.id, false)}
                              className="cursor-pointer"
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-400" />
                              <span className="text-red-400">Revoke Verification</span>
                            </DropdownMenuItem>
                          )}
                          {!driver.on_hold ? (
                            <DropdownMenuItem
                              onClick={() => setHoldDialogOpen(driver.id)}
                              className="cursor-pointer"
                            >
                              <Pause className="mr-2 h-4 w-4 text-yellow-400" />
                              <span className="text-yellow-400">Put on Hold</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => putDriverOnHold(driver.id, false)}
                              className="cursor-pointer"
                            >
                              <Play className="mr-2 h-4 w-4 text-green-400" />
                              <span className="text-green-400">Remove from Hold</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-zinc-700" />
                          <AlertDialog open={deleteDialogOpen === driver.id} onOpenChange={(open) => setDeleteDialogOpen(open ? driver.id : null)}>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-400 focus:text-red-400 cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Driver
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Driver</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                  Are you sure you want to delete {driver.user?.name}? This action cannot be undone and will remove all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteDriver(driver.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>

    {/* Hold Dialog */}
    <AlertDialog open={holdDialogOpen !== null} onOpenChange={(open) => {
      if (!open) {
        setHoldDialogOpen(null)
        setHoldReason('')
      }
    }}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Put Driver on Hold</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            This will temporarily suspend the driver. They won't be able to accept new deliveries.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Reason (Optional)</Label>
            <Textarea
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              placeholder="Enter reason for putting driver on hold..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => holdDialogOpen && putDriverOnHold(holdDialogOpen, true)}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Put on Hold
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  )
}
