import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/orders/[id] - Get order details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants(id, name, logo_url, address, lat, lng, phone:owner_id),
        order_items(*),
        driver:drivers(
          id,
          current_lat,
          current_lng,
          vehicle_type,
          vehicle_number,
          user:users(name, phone)
        ),
        status_history:order_status_history(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Verify user has access to this order
    if (order.customer_id !== user.id) {
      // Check if user is admin, restaurant owner, or assigned driver
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json({ order })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, driver_id, cancellation_reason } = body

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (driver_id) updateData.driver_id = driver_id
    if (cancellation_reason) {
      updateData.cancellation_reason = cancellation_reason
      updateData.cancelled_by = 'customer'
    }
    if (status === 'delivered') {
      updateData.actual_delivery_time = new Date().toISOString()
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Add to status history
    if (status) {
      await supabase.from('order_status_history').insert({
        order_id: id,
        status,
        created_by: user.id,
      })
    }

    return NextResponse.json({ order })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
