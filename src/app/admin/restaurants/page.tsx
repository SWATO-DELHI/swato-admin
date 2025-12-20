import { createClient } from '@/lib/supabase/server'
import { RestaurantsTable } from '@/components/admin/restaurants/RestaurantsTable'

export default async function RestaurantsPage() {
  const supabase = await createClient()

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Restaurants</h1>
        <p className="text-zinc-400 mt-1">Manage restaurant partners and their listings</p>
      </div>

      <RestaurantsTable restaurants={restaurants || []} />
    </div>
  )
}
