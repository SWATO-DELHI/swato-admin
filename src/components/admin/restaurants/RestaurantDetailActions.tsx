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
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Ban, Trash2, Edit } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  is_verified: boolean | null
  is_active: boolean | null
  is_blocked: boolean | null
  commission_rate: number | null
}

interface RestaurantDetailActionsProps {
  restaurant: Restaurant
}

export function RestaurantDetailActions({ restaurant }: RestaurantDetailActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleVerify(verify: boolean) {
    setIsLoading(true)
    const { error } = await supabase
      .from('restaurants')
      .update({ is_verified: verify })
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

  return (
    <div className="flex gap-2">
      {!restaurant.is_verified ? (
        <Button
          onClick={() => handleVerify(true)}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Verify
        </Button>
      ) : (
        <Button
          onClick={() => handleVerify(false)}
          disabled={isLoading}
          variant="outline"
          className="border-zinc-700"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Revoke Verification
        </Button>
      )}

      {restaurant.is_blocked ? (
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
      )}

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
  )
}
