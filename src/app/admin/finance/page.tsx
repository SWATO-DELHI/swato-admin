import { createClient } from '@/lib/supabase/server'
import { FinancePanel } from '@/components/admin/finance/FinancePanel'

export default async function FinancePage() {
  const supabase = await createClient()

  const [
    { data: transactions },
    { data: settlements },
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('settlements')
      .select(`
        *,
        restaurant:restaurants(name),
        driver:drivers(user:users(name))
      `)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Finance</h1>
        <p className="text-zinc-400 mt-1">Manage transactions and settlements</p>
      </div>

      <FinancePanel transactions={transactions || []} settlements={settlements || []} />
    </div>
  )
}
