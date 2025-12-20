import { createClient } from '@/lib/supabase/server'
import { DriversTable } from '@/components/admin/drivers/DriversTable'

export default async function DriversPage() {
  const supabase = await createClient()

  const { data: drivers } = await supabase
    .from('drivers')
    .select(`
      *,
      user:users!drivers_user_id_fkey(id, name, email, phone, avatar_url)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Delivery Partners</h1>
        <p className="text-zinc-400 mt-1">Manage drivers and track their performance</p>
      </div>

      <DriversTable drivers={drivers || []} />
    </div>
  )
}
