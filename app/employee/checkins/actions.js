'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getApprovedGoals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('goals')
    .select('*, thrust_areas(name)')
    .eq('employee_id', user.id)
    .eq('status', 'approved')
  
  if (error) throw new Error(error.message)
  return data
}

export async function getCheckIns(quarter) {
  if (!quarter) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('employee_id', user.id)
    .eq('quarter', quarter)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching check-ins:', error)
    return []
  }
  return data
}

export async function submitCheckIn(goalId, checkInData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Get goal to get manager_id and cycle_id
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('manager_id, cycle_id')
    .eq('id', goalId)
    .single()

  if (goalError || !goal) {
    return { error: 'Goal not found or unauthorized' }
  }

  // 2. Upsert check-in
  const { error } = await supabase
    .from('check_ins')
    .upsert({
      goal_id: goalId,
      employee_id: user.id,
      manager_id: goal.manager_id,
      cycle_id: goal.cycle_id,
      quarter: checkInData.quarter,
      actual_value: checkInData.uom_type === 'timeline' ? null : checkInData.actual_value,
      actual_date: checkInData.uom_type === 'timeline' ? checkInData.actual_date : null,
      status: checkInData.status,
      notes: checkInData.notes,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'goal_id, quarter, cycle_id'
    })

  if (error) {
    console.error('Upsert error:', error)
    return { error: error.message }
  }
  
  revalidatePath('/employee/checkins')
  revalidatePath('/manager/team')
  return { success: true }
}
