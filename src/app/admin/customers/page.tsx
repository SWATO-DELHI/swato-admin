import { createClient } from '@/lib/supabase/server'
import { CustomersTable } from '@/components/admin/customers/CustomersTable'

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-zinc-400 mt-1">Manage customer accounts and view their activity</p>
      </div>

      <CustomersTable customers={customers || []} />
    </div>
  )
}
