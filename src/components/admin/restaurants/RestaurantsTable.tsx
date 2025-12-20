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
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Search, Filter, MoreHorizontal, Eye, CheckCircle, XCircle, Star, Trash2, Ban, FileText } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Restaurant {
  id: string
  name: string
  slug: string
  address: string
  logo_url: string | null
  rating: number | null
  is_active: boolean | null
  is_verified: boolean | null
  is_blocked: boolean | null
  review_notes: string | null
  commission_rate: number | null
  created_at: string
}

interface RestaurantsTableProps {
  restaurants: Restaurant[]
}

export function RestaurantsTable({ restaurants: initialRestaurants }: RestaurantsTableProps) {
  const [restaurants, setRestaurants] = useState(initialRestaurants)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [blockDialogOpen, setBlockDialogOpen] = useState<string | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && restaurant.is_verified) ||
      (statusFilter === 'pending' && !restaurant.is_verified) ||
      (statusFilter === 'active' && restaurant.is_active) ||
      (statusFilter === 'inactive' && !restaurant.is_active) ||
      (statusFilter === 'blocked' && restaurant.is_blocked)

    return matchesSearch && matchesStatus
  })

  async function updateRestaurantStatus(id: string, field: 'is_active' | 'is_verified', value: boolean) {
    const { error } = await supabase
      .from('restaurants')
      .update({ [field]: value })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update restaurant')
      return
    }

    setRestaurants(restaurants.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ))
    toast.success('Restaurant updated successfully')
  }

  async function deleteRestaurant(id: string) {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete restaurant')
      return
    }

    setRestaurants(restaurants.filter(r => r.id !== id))
    toast.success('Restaurant deleted successfully')
    setDeleteDialogOpen(null)
  }

  async function blockRestaurant(id: string, block: boolean) {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('restaurants')
      .update({
        is_blocked: block,
        is_active: block ? false : undefined,
        blocked_reason: block ? blockReason : null,
        blocked_at: block ? new Date().toISOString() : null,
        blocked_by: block ? user?.id : null,
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update restaurant')
      return
    }

    setRestaurants(restaurants.map(r =>
      r.id === id ? {
        ...r,
        is_blocked: block,
        is_active: block ? false : r.is_active,
      } : r
    ))
    toast.success(`Restaurant ${block ? 'blocked' : 'unblocked'} successfully`)
    setBlockDialogOpen(null)
    setBlockReason('')
  }

  async function saveReviewNotes(id: string) {
    const { error } = await supabase
      .from('restaurants')
      .update({ review_notes: reviewNotes })
      .eq('id', id)

    if (error) {
      toast.error('Failed to save review')
      return
    }

    setRestaurants(restaurants.map(r =>
      r.id === id ? { ...r, review_notes: reviewNotes } : r
    ))
    toast.success('Review notes saved')
    setReviewDialogOpen(null)
    setReviewNotes('')
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search restaurants..."
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
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending Verification</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Restaurant
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Address
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Rating
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Commission
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Joined
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredRestaurants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                  No restaurants found
                </td>
              </tr>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage src={restaurant.logo_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg">
                          {restaurant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/admin/restaurants/${restaurant.id}`}
                          className="text-sm font-medium text-white hover:text-orange-400 transition-colors"
                        >
                          {restaurant.name}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300 max-w-xs truncate">
                    {restaurant.address}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-white">{restaurant.rating?.toFixed(1) || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {restaurant.commission_rate}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Badge
                        className={`border ${
                          restaurant.is_verified
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}
                      >
                        {restaurant.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                      <Badge
                        className={`border ${
                          restaurant.is_active
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                        }`}
                      >
                        {restaurant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {restaurant.is_blocked && (
                        <Badge className="border bg-red-500/10 text-red-400 border-red-500/30">
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {formatDistanceToNow(new Date(restaurant.created_at), { addSuffix: true })}
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
                          <Link href={`/admin/restaurants/${restaurant.id}`} className="flex items-center cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-700" />

                        <Dialog open={reviewDialogOpen === restaurant.id} onOpenChange={(open) => {
                          setReviewDialogOpen(open ? restaurant.id : null)
                          if (open) {
                            setReviewNotes(restaurant.review_notes || '')
                          } else {
                            setReviewNotes('')
                          }
                        }}>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                              <FileText className="mr-2 h-4 w-4" />
                              Review & Notes
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-white">Review Restaurant: {restaurant.name}</DialogTitle>
                              <DialogDescription className="text-zinc-400">
                                Add review notes and comments about this restaurant
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="space-y-2">
                                <Label className="text-zinc-300">Review Notes</Label>
                                <Textarea
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  placeholder="Enter review notes..."
                                  className="bg-zinc-800 border-zinc-700 text-white min-h-[150px] resize-none"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setReviewDialogOpen(null)}
                                className="border-zinc-700"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => saveReviewNotes(restaurant.id)}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                Save Review
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {!restaurant.is_verified && (
                          <DropdownMenuItem
                            onClick={() => updateRestaurantStatus(restaurant.id, 'is_verified', true)}
                            className="cursor-pointer"
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-400" />
                            <span className="text-blue-400">Verify Restaurant</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => updateRestaurantStatus(restaurant.id, 'is_active', !restaurant.is_active)}
                          className="cursor-pointer"
                        >
                          {restaurant.is_active ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4 text-red-400" />
                              <span className="text-red-400">Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                              <span className="text-green-400">Activate</span>
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-zinc-700" />

                        {!restaurant.is_blocked ? (
                          <AlertDialog open={blockDialogOpen === restaurant.id} onOpenChange={(open) => {
                            setBlockDialogOpen(open ? restaurant.id : null)
                            if (!open) setBlockReason('')
                          }}>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                <Ban className="mr-2 h-4 w-4 text-red-400" />
                                <span className="text-red-400">Block Restaurant</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Block Restaurant</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                  This will block {restaurant.name} and prevent them from receiving orders.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label className="text-zinc-300">Reason (Optional)</Label>
                                  <Textarea
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Enter reason for blocking..."
                                    className="bg-zinc-800 border-zinc-700 text-white min-h-[100px] resize-none"
                                  />
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => blockRestaurant(restaurant.id, true)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Block Restaurant
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => blockRestaurant(restaurant.id, false)}
                            className="cursor-pointer"
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                            <span className="text-green-400">Unblock Restaurant</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-zinc-700" />

                        <AlertDialog open={deleteDialogOpen === restaurant.id} onOpenChange={(open) => setDeleteDialogOpen(open ? restaurant.id : null)}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-400 focus:text-red-400 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Restaurant
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Restaurant</AlertDialogTitle>
                              <AlertDialogDescription className="text-zinc-400">
                                Are you sure you want to delete {restaurant.name}? This action cannot be undone and will remove all associated data including menu items and order history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteRestaurant(restaurant.id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
