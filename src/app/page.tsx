import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, redirect to admin dashboard
  if (user) {
    redirect('/admin/dashboard')
  }

  // If not authenticated, redirect to login
  redirect('/login')
}
