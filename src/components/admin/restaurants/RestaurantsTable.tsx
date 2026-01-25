// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
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
  metadata: any
  rating: number | null
  is_active: boolean | null
  verification_status: 'pending' | 'approved' | 'rejected' | null
  is_blocked: boolean | null
  review_notes: string | null
  rejection_reason: string | null
  fssai_doc_url: string | null
  pan_doc_url: string | null
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
  const [documentUrls, setDocumentUrls] = useState<{fssai: string | null, pan: string | null}>({fssai: null, pan: null})
  const [rejectReason, setRejectReason] = useState('')
  const [isReviewing, setIsReviewing] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel('restaurants-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurants' },
        (payload) => {
           if (payload.eventType === 'INSERT') {
               const newRestaurant = payload.new as Restaurant;
               setRestaurants((prev) => [newRestaurant, ...prev]);
               if (newRestaurant.verification_status === 'pending') {
                   toast("New Application Received", {
                       description: `${newRestaurant.name} has signed up.`,
                       action: {
                           label: "Review",
                           onClick: () => {
                               setSearchQuery(newRestaurant.name) // Filter to it
                               // Open review logic?
                           }
                       }
                   });
               }
           } else if (payload.eventType === 'UPDATE') {
               const updated = payload.new as Restaurant;
               setRestaurants((prev) => prev.map(r => r.id === updated.id ? updated : r));

               // If status changed to pending (re-submission)
               if (updated.verification_status === 'pending' && payload.old && payload.old.verification_status !== 'pending') {
                   toast("Application Re-submitted", {
                       description: `${updated.name} has updated their documents.`,
                   });
               }
           } else if (payload.eventType === 'DELETE') {
               setRestaurants((prev) => prev.filter(r => r.id !== payload.old.id));
           }
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const fetchDocuments = async (restaurant: Restaurant) => {
      // Assuming urls are paths like 'partner-documents/pan/...'
      // Needs to be signed
      let fssaiSigned = null
      let panSigned = null

      if (restaurant.fssai_doc_url) {
          const { data } = await supabase.storage.from('partner-documents').createSignedUrl(restaurant.fssai_doc_url, 3600)
          fssaiSigned = data?.signedUrl
      }
      if (restaurant.pan_doc_url) {
          const { data } = await supabase.storage.from('partner-documents').createSignedUrl(restaurant.pan_doc_url, 3600)
          panSigned = data?.signedUrl
      }
      setDocumentUrls({ fssai: fssaiSigned, pan: panSigned })
  }

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && restaurant.verification_status === 'approved') ||
      (statusFilter === 'pending' && restaurant.verification_status === 'pending') ||
      (statusFilter === 'active' && restaurant.is_active) ||
      (statusFilter === 'inactive' && !restaurant.is_active) ||
      (statusFilter === 'blocked' && restaurant.is_blocked)

    return matchesSearch && matchesStatus
  })

  async function updateVerificationStatus(id: string, status: 'approved' | 'rejected', reason?: string) {
    const updateBody: any = { verification_status: status }
    if (reason) updateBody.rejection_reason = reason

    const { error } = await supabase
      .from('restaurants')
      .update(updateBody)
      .eq('id', id)

    if (error) {
      toast.error(`Failed to ${status} restaurant`)
      return
    }

    setRestaurants(restaurants.map(r =>
      r.id === id ? { ...r, verification_status: status, rejection_reason: reason || null } : r
    ))
    toast.success(`Restaurant ${status} successfully`)
  }

  async function updateActiveStatus(id: string, active: boolean) {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: active })
        .eq('id', id)

      if (error) {
        toast.error('Failed to update status')
        return
      }

      setRestaurants(restaurants.map(r =>
        r.id === id ? { ...r, is_active: active } : r
      ))
      toast.success('Status updated')
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
    <Card className="bg-card border-border">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border text-foreground"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-muted border-border text-foreground">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
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
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Restaurant
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Address
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Rating
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Commission
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Joined
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRestaurants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No restaurants found
                </td>
              </tr>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage src={restaurant.logo_url || restaurant.metadata?.restaurantImages?.[0] || ''} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg">
                          {restaurant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/admin/restaurants/${restaurant.id}`}
                          className="text-sm font-medium text-foreground hover:text-orange-400 transition-colors"
                        >
                          {restaurant.name}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/80 max-w-xs truncate">
                    {restaurant.address}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-foreground">{restaurant.rating?.toFixed(1) || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/80">
                    {restaurant.commission_rate}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Badge
                        className={`border ${
                          restaurant.verification_status === 'approved'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : restaurant.verification_status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}
                      >
                        {restaurant.verification_status === 'approved' ? 'Verified' : restaurant.verification_status === 'rejected' ? 'Rejected' : 'Pending'}
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
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(restaurant.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/restaurants/${restaurant.id}`} className="flex items-center cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />

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
                          <DialogContent className="bg-card border-border max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Review Restaurant: {restaurant.name}</DialogTitle>
                              <DialogDescription className="text-muted-foreground">
                                Add review notes and comments about this restaurant
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="space-y-2">
                                <Label className="text-foreground/80">Review Notes</Label>
                                <Textarea
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  placeholder="Enter review notes..."
                                  className="bg-muted border-border text-foreground min-h-[150px] resize-none"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setReviewDialogOpen(null)}
                                className="border-border"
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
                        <DropdownMenuSeparator className="bg-border" />

                        {restaurant.verification_status !== 'approved' && (
                           <Dialog open={isReviewing === restaurant.id} onOpenChange={(open) => {
                               setIsReviewing(open ? restaurant.id : null)
                               if(open) {
                                   fetchDocuments(restaurant)
                               }
                           }}>
                             <DialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                 <CheckCircle className="mr-2 h-4 w-4 text-blue-400" />
                                 <span className="text-blue-400">Review Application</span>
                               </DropdownMenuItem>
                             </DialogTrigger>
                             <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
                               <DialogHeader>
                                 <DialogTitle className="text-foreground">Review Application: {restaurant.name}</DialogTitle>
                                 <DialogDescription className="text-muted-foreground">
                                   Review all submitted data and approve or reject the application.
                                 </DialogDescription>
                               </DialogHeader>

                               <div className="space-y-6 mt-4">
                                  {/* Restaurant Basic Info */}
                                  <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="text-sm font-medium text-foreground mb-3">Basic Information</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="ml-2 text-foreground">{restaurant.name}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Address:</span>
                                        <span className="ml-2 text-foreground">{restaurant.address || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Documents */}
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                          <Label className="text-foreground/80">FSSAI Document</Label>
                                          {documentUrls.fssai ? (
                                              <a href={documentUrls.fssai} target="_blank" rel="noopener noreferrer" className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                                                  <div className="flex items-center justify-center h-32 bg-muted rounded mb-2">
                                                      <FileText className="h-10 w-10 text-muted-foreground" />
                                                  </div>
                                                  <p className="text-center text-sm text-blue-400">View FSSAI</p>
                                              </a>
                                          ) : (
                                              <div className="p-4 border border-border rounded-lg bg-muted/50">
                                                  <p className="text-center text-sm text-muted-foreground">No document uploaded</p>
                                              </div>
                                          )}
                                      </div>
                                      <div className="space-y-2">
                                          <Label className="text-foreground/80">PAN Document</Label>
                                          {documentUrls.pan ? (
                                              <a href={documentUrls.pan} target="_blank" rel="noopener noreferrer" className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                                                  <div className="flex items-center justify-center h-32 bg-muted rounded mb-2">
                                                      <FileText className="h-10 w-10 text-muted-foreground" />
                                                  </div>
                                                  <p className="text-center text-sm text-blue-400">View PAN</p>
                                              </a>
                                          ) : (
                                              <div className="p-4 border border-border rounded-lg bg-muted/50">
                                                  <p className="text-center text-sm text-muted-foreground">No document uploaded</p>
                                              </div>
                                          )}
                                      </div>
                                  </div>

                                  {/* View Details Link */}
                                  <div className="text-center">
                                    <Link
                                      href={`/admin/restaurants/${restaurant.id}`}
                                      className="text-sm text-blue-400 hover:text-blue-300 underline"
                                      onClick={() => setIsReviewing(null)}
                                    >
                                      View Complete Details with Map & Images →
                                    </Link>
                                  </div>

                                  <div className="space-y-2">
                                      <Label className="text-foreground/80">Rejection Reason (If rejecting)</Label>
                                      <Textarea
                                          value={rejectReason}
                                          onChange={(e) => setRejectReason(e.target.value)}
                                          placeholder="e.g. Documents are blurry, Name mismatch..."
                                          className="bg-muted border-border text-foreground"
                                      />
                                  </div>
                               </div>

                               <DialogFooter className="gap-2 sm:gap-0">
                                 <Button
                                   variant="destructive"
                                   onClick={() => {
                                       if(!rejectReason) {
                                           toast.error("Please provide a reason for rejection");
                                           return;
                                       }
                                       updateVerificationStatus(restaurant.id, 'rejected', rejectReason);
                                       setIsReviewing(null);
                                   }}
                                 >
                                   Reject Application
                                 </Button>
                                 <Button
                                   className="bg-green-600 hover:bg-green-700"
                                   onClick={() => {
                                       updateVerificationStatus(restaurant.id, 'approved');
                                       setIsReviewing(null);
                                   }}
                                 >
                                   Approve Application
                                 </Button>
                               </DialogFooter>
                             </DialogContent>
                           </Dialog>
                        )}

                        <DropdownMenuItem
                          onClick={() => updateActiveStatus(restaurant.id, !restaurant.is_active)}
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

                        <DropdownMenuSeparator className="bg-border" />

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
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Block Restaurant</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  This will block {restaurant.name} and prevent them from receiving orders.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label className="text-foreground/80">Reason (Optional)</Label>
                                  <Textarea
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Enter reason for blocking..."
                                    className="bg-muted border-border text-foreground min-h-[100px] resize-none"
                                  />
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
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

                        <DropdownMenuSeparator className="bg-border" />

                        <AlertDialog open={deleteDialogOpen === restaurant.id} onOpenChange={(open) => setDeleteDialogOpen(open ? restaurant.id : null)}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-400 focus:text-red-400 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Restaurant
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Delete Restaurant</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Are you sure you want to delete {restaurant.name}? This action cannot be undone and will remove all associated data including menu items and order history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
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
