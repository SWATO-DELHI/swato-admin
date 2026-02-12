import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/promotions/validate - Validate promo code
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, order_total, restaurant_id } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 })
    }

    // Find promotion
    const { data: promo, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .gte('valid_until', new Date().toISOString())
      .single()

    if (error || !promo) {
      return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 })
    }

    // Check usage limit
    if (promo.usage_limit != null && (promo.used_count ?? 0) >= promo.usage_limit) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 })
    }

    // Check minimum order
    if (promo.min_order && order_total < promo.min_order) {
      return NextResponse.json({
        error: `Minimum order amount is ₹${promo.min_order}`
      }, { status: 400 })
    }

    // Check if applicable to restaurant
    if (promo.applicable_to === 'specific_restaurants' && promo.restaurant_ids) {
      if (!promo.restaurant_ids.includes(restaurant_id)) {
        return NextResponse.json({
          error: 'Promo code not valid for this restaurant'
        }, { status: 400 })
      }
    }

    // Check if user already used this promo
    const { data: usage } = await supabase
      .from('promotion_usage')
      .select('id')
      .eq('promotion_id', promo.id)
      .eq('user_id', user.id)
      .single()

    if (usage) {
      return NextResponse.json({ error: 'You have already used this promo code' }, { status: 400 })
    }

    // Calculate discount
    let discount = 0
    if (promo.type === 'percentage') {
      discount = (order_total * promo.value) / 100
      if (promo.max_discount) {
        discount = Math.min(discount, promo.max_discount)
      }
    } else {
      discount = promo.value
    }

    return NextResponse.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        title: promo.title,
        type: promo.type,
        value: promo.value,
        discount,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
