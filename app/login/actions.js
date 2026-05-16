'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error, data: authData } = await (await createClient()).auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Fetch the user's role using the Admin client to bypass RLS during login
  const adminClient = await createAdminClient()
  
  console.log(`Login attempt for: ${authData.user.email} (ID: ${authData.user.id})`)

  let { data: userData, error: userError } = await adminClient
    .from('users')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (userError) {
    console.error('ID Lookup Error:', userError.message)
    
    // Fallback: Try lookup by email if ID lookup fails
    console.log('Attempting fallback lookup by email...')
    const { data: fallbackData, error: fallbackError } = await adminClient
      .from('users')
      .select('role')
      .eq('email', authData.user.email)
      .single()
    
    if (fallbackError) {
      console.error('Fallback Lookup Error:', fallbackError.message)
      return { error: `Failed to fetch user profile: ${fallbackError.message}` }
    }
    
    userData = fallbackData
  }

  console.log('User profile found, role:', userData.role)

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
