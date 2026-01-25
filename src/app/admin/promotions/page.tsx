// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { PromotionsPanel } from '@/components/admin/promotions/PromotionsPanel'

export default async function PromotionsPage() {
  const supabase = await createClient()

  const { data: promotions } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Promotions</h1>
        <p className="text-zinc-400 mt-1">Create and manage promotional codes</p>
      </div>

      <PromotionsPanel promotions={promotions || []} />
    </div>
  )
}
