'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Fetch the user's role from the public.users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (userError) {
    return { error: 'Failed to fetch user profile' }
  }

  // Redirect based on role
  const role = userData.role
  if (role === 'admin') {
    redirect('/admin/dashboard')
  } else if (role === 'manager') {
    redirect('/manager/dashboard')
  } else {
    redirect('/employee/dashboard')
  }
}
