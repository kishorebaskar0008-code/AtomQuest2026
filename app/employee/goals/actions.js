'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getThrustAreas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('thrust_areas')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function getActiveCycle() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('is_active', true)
    .single()
  
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function getEmployeeGoals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('goals')
    .select('*, thrust_areas(name)')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function createGoal(goalData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Validate constraints
  const { data: existingGoals } = await supabase
    .from('goals')
    .select('weightage')
    .eq('employee_id', user.id)
  
  if (existingGoals.length >= 8) {
    return { error: 'Maximum limit of 8 goals reached.' }
  }

  const totalWeightage = existingGoals.reduce((sum, g) => sum + Number(g.weightage), 0)
  const newWeightage = Number(goalData.weightage)

  if (totalWeightage + newWeightage > 100) {
    return { error: `Total weightage cannot exceed 100%. Current: ${totalWeightage}%, Remaining: ${100 - totalWeightage}%` }
  }

  if (newWeightage < 10) {
    return { error: 'Minimum weightage per goal is 10%.' }
  }

  // 2. Insert Goal
  const { error: insertError } = await supabase
    .from('goals')
    .insert({
      employee_id: user.id,
      manager_id: goalData.manager_id,
      thrust_area_id: goalData.thrust_area_id,
      cycle_id: goalData.cycle_id,
      title: goalData.title,
      description: goalData.description,
      uom_type: goalData.uom_type,
      target_value: goalData.target_value,
      target_date: goalData.target_date,
      weightage: newWeightage,
      status: 'draft'
    })

  if (insertError) return { error: insertError.message }

  revalidatePath('/employee/goals')
  return { success: true }
}

export async function deleteGoal(goalId) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('status', 'draft') // Only delete drafts

  if (error) return { error: error.message }
  
  revalidatePath('/employee/goals')
  return { success: true }
}
