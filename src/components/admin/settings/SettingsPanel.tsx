'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Settings, MapPin, Save, Loader2 } from 'lucide-react'

interface Setting {
  id: string
  key: string
  value: string
  description: string | null
}

interface Zone {
  id: string
  name: string
  city: string
  is_active: boolean | null
  base_delivery_fee: number | null
  per_km_fee: number | null
  min_order_amount: number | null
}

interface SettingsPanelProps {
  settings: Setting[]
  zones: Zone[]
}

const settingLabels: Record<string, string> = {
  delivery_radius_km: 'Delivery Radius (km)',
  min_order_amount: 'Minimum Order Amount (₹)',
  base_delivery_fee: 'Base Delivery Fee (₹)',
  per_km_fee: 'Per KM Fee (₹)',
  commission_rate: 'Default Commission Rate (%)',
  driver_payout_per_delivery: 'Driver Payout per Delivery (₹)',
  max_concurrent_orders_driver: 'Max Concurrent Orders per Driver',
}

export function SettingsPanel({ settings: initialSettings, zones }: SettingsPanelProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  function handleSettingChange(key: string, value: string) {
    setSettings(settings.map(s =>
      s.key === key ? { ...s, value: JSON.stringify(value) } : s
    ))
  }

  async function handleSaveSettings() {
    setIsLoading(true)

    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from('app_settings')
          .update({ value: setting.value })
          .eq('key', setting.key)

        if (error) throw error
      }
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* App Settings */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">App Configuration</h3>
            <p className="text-sm text-zinc-400">General application settings</p>
          </div>
        </div>

        <div className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.key} className="space-y-2">
              <Label className="text-zinc-300">{settingLabels[setting.key] || setting.key}</Label>
              <Input
                type="number"
                value={JSON.parse(setting.value)}
                onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              {setting.description && (
                <p className="text-xs text-zinc-500">{setting.description}</p>
              )}
            </div>
          ))}

          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Delivery Zones */}
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Delivery Zones</h3>
            <p className="text-sm text-zinc-400">Manage delivery areas</p>
          </div>
        </div>

        {zones.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">No delivery zones configured</p>
            <Button variant="outline" className="mt-4 border-zinc-700 text-zinc-300">
              Add Zone
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{zone.name}</h4>
                  <Badge
                    className={`border ${
                      zone.is_active
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                    }`}
                  >
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400">{zone.city}</p>
                <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                  <span>Base: ₹{zone.base_delivery_fee}</span>
                  <span>Per km: ₹{zone.per_km_fee}</span>
                  <span>Min order: ₹{zone.min_order_amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
