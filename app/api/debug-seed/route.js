import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const today = new Date()
  const q1Start = today.toISOString().split('T')[0]
  const q1End = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]

  console.log('--- EMERGENCY SEED VIA API ---')

  // 1. First, set ALL cycles to inactive (to avoid unique constraint issues)
  await supabase
    .from('cycles')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000') // just a dummy filter to update all

  // 2. Try to update FY 2025-26 or insert it
  const { data: existing } = await supabase
    .from('cycles')
    .select('*')
    .eq('name', 'FY 2025-26')
    .single()

  if (existing) {
    await supabase
      .from('cycles')
      .update({ 
        is_active: true,
        goal_setting_start: '2025-05-01',
        goal_setting_end: '2025-05-31',
        q1_start: q1Start,
        q1_end: q1End
      })
      .eq('id', existing.id)
    
    return NextResponse.json({ message: 'Success! Updated existing FY 2025-26 and set to Active.' })
  } else {
    const { error: insertError } = await supabase
      .from('cycles')
      .insert([{ 
        name: 'FY 2025-26',
        is_active: true,
        goal_setting_start: '2025-05-01',
        goal_setting_end: '2025-05-31',
        q1_start: q1Start,
        q1_end: q1End,
        q2_start: '2026-10-01',
        q2_end: '2026-10-31',
        q3_start: '2027-01-01',
        q3_end: '2027-01-31',
        q4_start: '2027-03-01',
        q4_end: '2027-04-30'
      }])

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
    return NextResponse.json({ message: 'Success! Created new FY 2025-26 cycle.' })
  }
}
