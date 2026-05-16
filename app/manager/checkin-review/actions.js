'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEmployeeCheckIns(employeeId, quarter) {
  const supabase = await createClient()

  // 1. Get goals first
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*, thrust_areas(name)')
    .eq('employee_id', employeeId)
    .eq('status', 'approved')
  
  if (goalsError) throw new Error(goalsError.message)

  // 2. Get check-ins for these goals and quarter
  const { data: checkIns, error: ciError } = await supabase
    .from('check_ins')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('quarter', quarter)
  
  if (ciError) throw new Error(ciError.message)

  // 3. Merge them
  return goals.map(goal => ({
    ...goal,
    checkIn: checkIns.find(c => c.goal_id === goal.id) || null
  }))
}

export async function submitManagerReview(employeeId, quarter, comments) {
  const supabase = await createClient()

  // Update all check-ins for this employee/quarter as reviewed
  const { error } = await supabase
    .from('check_ins')
    .update({
      manager_comment: comments,
      manager_checked_in: true,
      updated_at: new Date().toISOString()
    })
    .eq('employee_id', employeeId)
    .eq('quarter', quarter)

  if (error) return { error: error.message }
  
  revalidatePath(`/manager/checkin-review/${employeeId}`)
  return { success: true }
}
