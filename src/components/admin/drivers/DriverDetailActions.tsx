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
import { CheckCircle, XCircle, Pause, Trash2, Play } from 'lucide-react'

interface Driver {
  id: string
  is_verified: boolean | null
  on_hold: boolean | null
  user: { name: string } | null
}

interface DriverDetailActionsProps {
  driver: Driver
}

export function DriverDetailActions({ driver }: DriverDetailActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleVerify(verify: boolean) {
    setIsLoading(true)
    const { error } = await supabase
      .from('drivers')
      .update({ is_verified: verify })
      .eq('id', driver.id)

    if (error) {
      toast.error('Failed to update driver')
      setIsLoading(false)
      return
    }

    toast.success(`Driver ${verify ? 'verified' : 'unverified'} successfully`)
    router.refresh()
    setIsLoading(false)
  }

  async function handleHold(hold: boolean) {
    setIsLoading(true)
    const { error } = await supabase
      .from('drivers')
      .update({
        on_hold: hold,
        hold_started_at: hold ? new Date().toISOString() : null,
        hold_ended_at: hold ? null : new Date().toISOString(),
      })
      .eq('id', driver.id)

    if (error) {
      toast.error('Failed to update driver status')
      setIsLoading(false)
      return
    }

    toast.success(`Driver ${hold ? 'put on hold' : 'removed from hold'}`)
    router.refresh()
    setIsLoading(false)
  }

  async function handleDelete() {
    setIsLoading(true)
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', driver.id)

    if (error) {
      toast.error('Failed to delete driver')
      setIsLoading(false)
      return
    }

    toast.success('Driver deleted successfully')
    router.push('/admin/drivers')
  }

  return (
    <div className="flex gap-2">
      {!driver.is_verified ? (
        <Button
          onClick={() => handleVerify(true)}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Verify Driver
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

      {driver.on_hold ? (
        <Button
          onClick={() => handleHold(false)}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Play className="mr-2 h-4 w-4" />
          Remove from Hold
        </Button>
      ) : (
        <Button
          onClick={() => handleHold(true)}
          disabled={isLoading}
          variant="outline"
          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
        >
          <Pause className="mr-2 h-4 w-4" />
          Put on Hold
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
            <AlertDialogTitle className="text-white">Delete Driver</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete {driver.user?.name}? This action cannot be undone and will remove all associated data including delivery history.
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
