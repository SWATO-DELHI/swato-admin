import { createClient } from '@/lib/supabase/server'
import { SettingsPanel } from '@/components/admin/settings/SettingsPanel'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('app_settings')
    .select('*')
    .order('key')

  const { data: zones } = await supabase
    .from('delivery_zones')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Configure application settings</p>
      </div>

      <SettingsPanel settings={settings || []} zones={zones || []} />
    </div>
  )
}
