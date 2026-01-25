'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  link: string
  type: 'restaurant' | 'order' | 'info'
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchPendingRestaurants()

    // Subscribe to new restaurants
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'restaurants' },
        (payload) => {
           const newRest = payload.new as any;
           if (newRest.verification_status === 'pending') {
               addNotification({
                   id: `rest-${newRest.id}`,
                   title: 'New Restaurant Signup',
                   description: `${newRest.name} is waiting for verification`,
                   time: new Date().toISOString(),
                   read: false,
                   link: `/admin/restaurants?search=${newRest.name}`,
                   type: 'restaurant'
               })
           }
        }
      )
      .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
  }, [])

  const fetchPendingRestaurants = async () => {
      // Cast response to any to avoid strict type checks since we know columns exist
      const { data } = await supabase
        .from('restaurants')
        .select('id, name, created_at, verification_status')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
          const rows = data as any[];
          const items: NotificationItem[] = rows.map(r => ({
              id: `rest-${r.id}`,
              title: 'Pending Verification',
              description: `${r.name} needs review`,
              time: r.created_at,
              read: false,
              link: `/admin/restaurants?search=${r.name}`,
              type: 'restaurant'
          }))
          setNotifications(items)
          setUnreadCount(items.length)
      }
  }

  const addNotification = (item: NotificationItem) => {
      setNotifications(prev => [item, ...prev])
      setUnreadCount(prev => prev + 1)
  }

  const handleNotificationClick = (item: NotificationItem) => {
      // perform navigation
      router.push('/admin/restaurants') // Simple redirect
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-zinc-800"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-background dark:bg-zinc-900 border-border dark:border-zinc-800 shadow-xl z-50">
        <DropdownMenuLabel className="flex justify-between items-center p-3">
          <span>Notifications</span>
          <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                    No new notifications
                </div>
            ) : (
                notifications.map(item => (
                    <div key={item.id} onClick={() => handleNotificationClick(item)} className="cursor-pointer">
                        <DropdownMenuItem className="p-3 items-start gap-3 cursor-pointer focus:bg-accent/50 dark:focus:bg-zinc-800">
                            <div className="mt-1 shrink-0">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 break-words">{item.description}</p>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                                </p>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </div>
                ))
            )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
