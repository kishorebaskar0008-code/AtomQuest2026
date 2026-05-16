'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTeamProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch team members
  const { data: team, error } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('manager_id', user.id)
  
  if (error) throw new Error(error.message)

  // 2. Fetch goal summaries for each member
  const teamWithStats = await Promise.all(team.map(async (member) => {
    const { data: goals } = await supabase
      .from('goals')
      .select('status, weightage')
      .eq('employee_id', member.id)
    
    const totalWeightage = goals?.reduce((sum, g) => sum + Number(g.weightage), 0) || 0
    const status = goals?.length === 0 ? 'Not Started' : 
                   goals.every(g => g.status === 'approved') ? 'Approved' :
                   goals.some(g => g.status === 'submitted') ? 'Pending Review' : 'Draft'

    return {
      ...member,
      goalCount: goals?.length || 0,
      totalWeightage,
      status
    }
  }))

  return teamWithStats
}

export async function getEmployeeGoalsForManager(employeeId) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('goals')
    .select('*, thrust_areas(name)')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function approveAllGoals(employeeId) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('goals')
    .update({ status: 'approved' })
    .eq('employee_id', employeeId)
    .eq('status', 'submitted')

  if (error) return { error: error.message }
  
  revalidatePath('/manager/team')
  return { success: true }
}

export async function returnGoals(employeeId, comment) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('goals')
    .update({ 
      status: 'returned',
      comments: comment 
    })
    .eq('employee_id', employeeId)
    .eq('status', 'submitted')

  if (error) return { error: error.message }
  
  revalidatePath('/manager/team')
  return { success: true }
}

export async function getUserProfile(userId) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('id', userId)
    .single()
  
  if (error) throw new Error(error.message)
  return data
}
