import { createClient } from '@/lib/supabase/server'
import { SupportTickets } from '@/components/admin/support/SupportTickets'

export default async function SupportPage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select(`
      *,
      user:users!support_tickets_user_id_fkey(name, email),
      order:orders(order_number)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support</h1>
        <p className="text-zinc-400 mt-1">Manage customer support tickets</p>
      </div>

      <SupportTickets tickets={tickets || []} />
    </div>
  )
}
