'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTeamProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch team members
  const { data: team, error } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('manager_id', user.id)
  
  if (error) throw new Error(error.message)

  // 2. Get current quarter context
  const { data: activeCycle } = await supabase
    .from('cycles')
    .select('*')
    .eq('is_active', true)
    .single()
  
  const { getCurrentQuarterInfo } = require('@/lib/utils/dateHelpers')
  const quarterInfo = getCurrentQuarterInfo(activeCycle)

  // 3. Fetch goal and check-in summaries for each member
  const teamWithStats = await Promise.all(team.map(async (member) => {
    const { data: goals } = await supabase
      .from('goals')
      .select('id, status, weightage')
      .eq('employee_id', member.id)
    
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('manager_checked_in')
      .eq('employee_id', member.id)
      .eq('quarter', quarterInfo?.name)
    
    const totalWeightage = goals?.reduce((sum, g) => sum + Number(g.weightage), 0) || 0
    const goalStatus = goals?.length === 0 ? 'Not Started' : 
                       goals.every(g => g.status === 'approved') ? 'Approved' :
                       goals.some(g => g.status === 'submitted') ? 'Pending Review' : 'Draft'

    // Q1 Progress Status
    const totalCheckIns = checkIns?.length || 0
    const reviewedCheckIns = checkIns?.filter(c => c.manager_checked_in).length || 0

    let q1Status = 'Not Started'
    if (totalCheckIns > 0) {
      q1Status = reviewedCheckIns === totalCheckIns ? 'Reviewed' : 'Pending Review'
    }

    return {
      ...member,
      goalCount: goals?.length || 0,
      approvedCount: goals?.filter(g => g.status === 'approved').length || 0,
      totalWeightage,
      goalStatus,
      q1Status,
      q1Name: quarterInfo?.name || 'Q1'
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
      comment 
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
    .select('id, name, email')
    .eq('id', userId)
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function reviewGoal(goalId, status, comment, edits = {}) {
  const supabase = await createClient()
  
  const updateData = { 
    status,
    comment 
  }

  // If there are edits (manager changed target or weightage)
  if (edits.target_value !== undefined) updateData.target_value = edits.target_value
  if (edits.target_date !== undefined) updateData.target_date = edits.target_date
  if (edits.weightage !== undefined) updateData.weightage = Number(edits.weightage)

  const { error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', goalId)

  if (error) return { error: error.message }
  
  revalidatePath('/manager/team')
  return { success: true }
}

export async function getEmployeeCheckInsForManager(employeeId, quarter) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('quarter', quarter)
  
  if (error) throw new Error(error.message)
  return data
}

export async function reviewCheckIn(checkInId, comment) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('check_ins')
    .update({ 
      manager_comment: comment,
      manager_checked_in: true,
      manager_reviewed_at: new Date().toISOString()
    })
    .eq('id', checkInId)

  if (error) return { error: error.message }
  
  revalidatePath('/manager/team')
  return { success: true }
}
