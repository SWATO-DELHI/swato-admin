import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/orders - List orders for authenticated user
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants(id, name, logo_url, address),
        order_items(*)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ orders: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/orders - Create new order
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      restaurant_id,
      items,
      delivery_address,
      delivery_lat,
      delivery_lng,
      delivery_instructions,
      payment_method,
      promo_code,
    } = body

    // Calculate totals
    let subtotal = 0
    for (const item of items) {
      subtotal += item.price * item.quantity
    }

    // Apply promo code if provided
    let discount = 0
    if (promo_code) {
      const { data: promo } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .single()

      if (promo && subtotal >= (promo.min_order || 0)) {
        if (promo.type === 'percentage') {
          discount = (subtotal * promo.value) / 100
          if (promo.max_discount) {
            discount = Math.min(discount, promo.max_discount)
          }
        } else {
          discount = promo.value
        }
      }
    }

    // Get delivery fee from settings
    const { data: settings } = await supabase
      .from('app_settings')
      .select('*')
      .in('key', ['base_delivery_fee'])

    const deliveryFee = settings?.find(s => s.key === 'base_delivery_fee')?.value || 30
    const total = subtotal + parseFloat(String(deliveryFee)) - discount

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        restaurant_id,
        subtotal,
        delivery_fee: parseFloat(String(deliveryFee)),
        discount,
        total,
        delivery_address,
        delivery_lat,
        delivery_lng,
        delivery_instructions,
        payment_method,
        order_number: `SWT${Date.now()}`, // Temporary, trigger will override
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 })
    }

    // Create order items
    const orderItems = items.map((item: { menu_item_id: string; name: string; quantity: number; price: number; notes?: string }) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    // Create status history
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: 'pending',
      created_by: user.id,
    })

    return NextResponse.json({ order })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
