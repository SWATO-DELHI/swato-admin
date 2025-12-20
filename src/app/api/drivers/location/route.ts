import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/drivers/location - Update driver location
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lat, lng, order_id } = await request.json()

    // Get driver record
    const { data: driver } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    // Update current location
    const { error: updateError } = await supabase
      .from('drivers')
      .update({
        current_lat: lat,
        current_lng: lng,
        last_location_update: new Date().toISOString(),
      })
      .eq('id', driver.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Log location history if on active delivery
    if (order_id) {
      await supabase.from('driver_locations').insert({
        driver_id: driver.id,
        order_id,
        lat,
        lng,
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
