import { createClient } from '@/lib/supabase/server'
import { NotificationsPanel } from '@/components/admin/notifications/NotificationsPanel'

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-zinc-400 mt-1">Send push notifications to users</p>
      </div>

      <NotificationsPanel notifications={notifications || []} />
    </div>
  )
}
