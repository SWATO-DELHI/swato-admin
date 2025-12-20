import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/restaurants - List restaurants
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const cuisine = searchParams.get('cuisine')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('rating', { ascending: false })
      .limit(limit)

    if (cuisine) {
      query = query.contains('cuisine_type', [cuisine])
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // TODO: Filter by distance if lat/lng provided
    // This would require PostGIS or calculating distance in application

    return NextResponse.json({ restaurants: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
