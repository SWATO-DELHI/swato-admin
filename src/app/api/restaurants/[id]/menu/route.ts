import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/restaurants/[id]/menu - Get restaurant menu
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get categories with items
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', id)
      .eq('is_active', true)
      .order('sort_order')

    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 400 })
    }

    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', id)
      .eq('is_available', true)
      .order('name')

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    // Group items by category
    const menu = categories?.map(cat => ({
      ...cat,
      items: items?.filter(item => item.category_id === cat.id) || [],
    }))

    // Add uncategorized items
    const uncategorizedItems = items?.filter(item => !item.category_id) || []
    if (uncategorizedItems.length > 0) {
      menu?.push({
        id: 'uncategorized',
        name: 'Other Items',
        restaurant_id: id,
        sort_order: 999,
        is_active: true,
        description: null,
        created_at: new Date().toISOString(),
        items: uncategorizedItems,
      })
    }

    return NextResponse.json({ menu })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
