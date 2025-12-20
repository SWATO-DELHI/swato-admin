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
import { Ban, CheckCircle } from 'lucide-react'

interface Customer {
  id: string
  name: string
  status: string
}

interface CustomerDetailActionsProps {
  customer: Customer
}

export function CustomerDetailActions({ customer }: CustomerDetailActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggleCustomerStatus() {
    setIsLoading(true)
    const newStatus = customer.status === 'active' ? 'blocked' : 'active'

    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', customer.id)

    if (error) {
      toast.error('Failed to update customer status')
      setIsLoading(false)
      return
    }

    toast.success(`Customer ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`)
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="flex gap-2">
      {customer.status === 'active' ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
              disabled={isLoading}
            >
              <Ban className="mr-2 h-4 w-4" />
              Block Customer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Block Customer</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Are you sure you want to block {customer.name}? They will not be able to place orders.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={toggleCustomerStatus}
                className="bg-red-600 hover:bg-red-700"
              >
                Block Customer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          onClick={toggleCustomerStatus}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Unblock Customer
        </Button>
      )}
    </div>
  )
}
