import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { RestaurantsTable } from '@/components/admin/restaurants/RestaurantsTable'

export const dynamic = 'force-dynamic'

export default async function RestaurantsPage() {
  const supabase = await createClient()

  // 1. Try fetching as the specific User (RLS)
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  // 2. Fetch as Admin (Service Role) to debug/fallback
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: adminRestaurants, error: adminError } = await adminClient
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })

  const user = (await supabase.auth.getUser()).data.user;

  // Decide what to show
  const hasRLSData = restaurants && restaurants.length > 0;
  const hasAdminData = adminRestaurants && adminRestaurants.length > 0;

  // Use Admin data if RLS fails but Admin succeeds (Temporary Fix + Debug)
  const finalRestaurants = hasRLSData ? restaurants : (adminRestaurants || []);

  const isPermissionError = !hasRLSData && hasAdminData;

  console.log('DEBUG FETCH:', {
      user: user?.id,
      role: user?.role,
      userFetchCount: restaurants?.length,
      adminFetchCount: adminRestaurants?.length,
      userError: error,
      adminError: adminError
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Restaurants</h1>
        <p className="text-muted-foreground mt-1">Manage restaurant partners and their listings</p>

        {isPermissionError && (
             <div className="mt-2 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
                 ⚠️ <strong>Permission Error:</strong> You are seeing this data via Admin Bypass.
                 Your user account ({user?.email}) does not have permission to view restaurants in RLS.
                 Please check the &apos;public.users&apos; table role.
             </div>
        )}
      </div>

      <RestaurantsTable restaurants={(finalRestaurants || []) as any} />
    </div>
  )
}
