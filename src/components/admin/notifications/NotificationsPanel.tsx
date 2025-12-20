'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Bell, Send, Loader2, Users, Truck, Store, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  target_audience: string
  status: string | null
  sent_count: number | null
  failed_count: number | null
  created_at: string
}

interface NotificationsPanelProps {
  notifications: Notification[]
}

const audienceIcons: Record<string, typeof Users> = {
  all: Users,
  customers: Users,
  drivers: Truck,
  restaurants: Store,
}

export function NotificationsPanel({ notifications: initialNotifications }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetAudience, setTargetAudience] = useState('all')
  const supabase = createClient()

  async function handleSendNotification(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title,
          body,
          type: 'push',
          target_audience: targetAudience,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setNotifications([data, ...notifications])
      setTitle('')
      setBody('')
      setTargetAudience('all')
      toast.success('Notification sent successfully!')
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Send Notification Form */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Send Notification</h3>
            <p className="text-sm text-zinc-400">Push notification to users</p>
          </div>
        </div>

        <form onSubmit={handleSendNotification} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-300">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              required
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body" className="text-zinc-300">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notification message..."
              required
              rows={4}
              className="bg-zinc-800 border-zinc-700 text-white resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Target Audience</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="customers">Customers Only</SelectItem>
                <SelectItem value="drivers">Drivers Only</SelectItem>
                <SelectItem value="restaurants">Restaurants Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Notification History */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">Notification History</h3>
          <p className="text-sm text-zinc-400">Recent notifications sent</p>
        </div>

        <div className="divide-y divide-zinc-800 max-h-[500px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              No notifications sent yet
            </div>
          ) : (
            notifications.map((notification) => {
              const AudienceIcon = audienceIcons[notification.target_audience] || Users
              return (
                <div key={notification.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{notification.body}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <AudienceIcon className="h-3 w-3" />
                          <span className="capitalize">{notification.target_audience}</span>
                        </div>
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={`shrink-0 border ${
                        notification.status === 'sent'
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : notification.status === 'failed'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      {notification.status === 'sent' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : notification.status === 'failed' ? (
                        <XCircle className="h-3 w-3 mr-1" />
                      ) : null}
                      {notification.status}
                    </Badge>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
