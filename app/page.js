import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch role using admin client for initial redirect
  const adminClient = await createAdminClient()
  const { data: userData } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role === 'admin') {
    redirect('/admin/dashboard')
  } else if (userData?.role === 'manager') {
    redirect('/manager/dashboard')
  } else {
    redirect('/employee/dashboard')
  }
}
