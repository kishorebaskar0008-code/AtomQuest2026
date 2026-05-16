import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function seedCycle() {
  console.log('Seeding FY 2025-26 cycle...')
  
  const today = new Date()
  const q1Start = today.toISOString().split('T')[0]
  const q1End = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('cycles')
    .insert([
      { 
        name: 'FY 2025-26',
        is_active: true,
        goal_setting_start: '2025-05-01',
        goal_setting_end: '2025-05-31',
        q1_start: q1Start,
        q1_end: q1End,
        // Defaulting others to next year for now
        q2_start: '2026-10-01',
        q2_end: '2026-10-31',
        q3_start: '2027-01-01',
        q3_end: '2027-01-31',
        q4_start: '2027-03-01',
        q4_end: '2027-04-30'
      }
    ])

  if (error) {
    console.error('Error seeding cycle:', error.message)
  } else {
    console.log('Success! Cycle created and Q1 Window is OPEN.')
  }
}

seedCycle()
