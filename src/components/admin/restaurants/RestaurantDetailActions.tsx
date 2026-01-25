'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Ban, Trash2, ThumbsUp, ThumbsDown, Clock } from 'lucide-react'

// Restaurant interface with all onboarding fields
interface Restaurant {
  id: string
  name: string
  is_verified: boolean | null
  is_active: boolean | null
  is_blocked: boolean | null
  commission_rate: number | null
  verification_status: string | null
  onboarding_step: string | null
}

interface RestaurantDetailActionsProps {
  restaurant: Restaurant
}

export function RestaurantDetailActions({ restaurant }: RestaurantDetailActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const supabase = createClient()
  const router = useRouter()

  // Approve the restaurant application
  async function handleApprove() {
    setIsLoading(true)
    const { error } = await supabase
      .from('restaurants')
      .update({
        verification_status: 'approved',
        is_verified: true,
        is_active: true,
      })
      .eq('id', restaurant.id)

    if (error) {
      toast.error('Failed to approve restaurant')
      setIsLoading(false)
      return
    }

    toast.success('Restaurant application approved successfully!')
    router.refresh()
    setIsLoading(false)
  }

  // Reject the restaurant application
  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setIsLoading(true)
    const { error } = await supabase
      .from('restaurants')
      .update({
        verification_status: 'rejected',
        is_verified: false,
        is_active: false,
        // Store rejection reason in metadata
        metadata: {
          ...(restaurant as any).metadata,
          rejectionReason,
          rejectedAt: new Date().toISOString(),
        }
      })
      .eq('id', restaurant.id)

    if (error) {
      toast.error('Failed to reject restaurant')
      setIsLoading(false)
      return
    }

    toast.success('Restaurant application rejected')
    setShowRejectDialog(false)
    setRejectionReason('')
    router.refresh()
    setIsLoading(false)
  }

  // Toggle verification status (legacy)
  async function handleVerify(verify: boolean) {
    setIsLoading(true)
    const { error } = await supabase
      .from('restaurants')
      .update({
        is_verified: verify,
        verification_status: verify ? 'approved' : 'pending',
      })
      .eq('id', restaurant.id)

    if (error) {
      toast.error('Failed to update restaurant')
      setIsLoading(false)
      return
    }

    toast.success(`Restaurant ${verify ? 'verified' : 'unverified'} successfully`)
    router.refresh()
    setIsLoading(false)
  }

  // Block/Unblock restaurant
  async function handleBlock(block: boolean) {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('restaurants')
      .update({
        is_blocked: block,
        is_active: block ? false : undefined,
        blocked_at: block ? new Date().toISOString() : null,
        blocked_by: block ? user?.id : null,
      })
      .eq('id', restaurant.id)

    if (error) {
      toast.error('Failed to update restaurant')
      setIsLoading(false)
      return
    }

    toast.success(`Restaurant ${block ? 'blocked' : 'unblocked'} successfully`)
    router.refresh()
    setIsLoading(false)
  }

  // Delete restaurant
  async function handleDelete() {
    setIsLoading(true)
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', restaurant.id)

    if (error) {
      toast.error('Failed to delete restaurant')
      setIsLoading(false)
      return
    }

    toast.success('Restaurant deleted successfully')
    router.push('/admin/restaurants')
  }

  // Reset to pending status
  async function handleResetToPending() {
    setIsLoading(true)
    const { error } = await supabase
      .from('restaurants')
      .update({
        verification_status: 'pending',
        is_verified: false,
        is_active: false,
      })
      .eq('id', restaurant.id)

    if (error) {
      toast.error('Failed to reset status')
      setIsLoading(false)
      return
    }

    toast.success('Restaurant status reset to pending')
    router.refresh()
    setIsLoading(false)
  }

  // Determine which actions to show based on verification status
  const isPending = restaurant.verification_status === 'pending'
  const isApproved = restaurant.verification_status === 'approved'
  const isRejected = restaurant.verification_status === 'rejected'

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Pending Applications: Show Approve/Reject buttons */}
        {isPending && (
          <>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Approve Application
            </Button>
            <Button
              onClick={() => setShowRejectDialog(true)}
              disabled={isLoading}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Reject Application
            </Button>
          </>
        )}

        {/* Approved Restaurants: Show Revoke/Toggle options */}
        {isApproved && (
          <>
            <Button
              onClick={() => handleVerify(false)}
              disabled={isLoading}
              variant="outline"
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Revoke Verification
            </Button>
          </>
        )}

        {/* Rejected Applications: Allow reset to pending */}
        {isRejected && (
          <Button
            onClick={handleResetToPending}
            disabled={isLoading}
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
          >
            <Clock className="mr-2 h-4 w-4" />
            Reset to Pending
          </Button>
        )}

        {/* Block/Unblock actions (always available for verified restaurants) */}
        {isApproved && (
          restaurant.is_blocked ? (
            <Button
              onClick={() => handleBlock(false)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Unblock
            </Button>
          ) : (
            <Button
              onClick={() => handleBlock(true)}
              disabled={isLoading}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              <Ban className="mr-2 h-4 w-4" />
              Block
            </Button>
          )
        )}

        {/* Delete button (always available) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
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
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Rejection Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Application</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Please provide a reason for rejecting this restaurant application. This will be shared with the restaurant owner.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="text-zinc-300">Rejection Reason</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Documents are not clear, address verification failed, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              className="border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
