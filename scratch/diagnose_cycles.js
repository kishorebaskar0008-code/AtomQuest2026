import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function diagnoseCycles() {
  console.log('--- DB CYCLE DIAGNOSTIC ---')
  
  const { data: cycles, error } = await supabase
    .from('cycles')
    .select('*')

  if (error) {
    console.error('Error fetching cycles:', error.message)
    return
  }

  console.log(`Found ${cycles.length} cycles total.`)
  
  cycles.forEach(c => {
    console.log(`\nCycle: "${c.name}"`)
    console.log(`- Active: ${c.is_active}`)
    console.log(`- Q1 Start: "${c.q1_start}"`)
    console.log(`- Q1 End: "${c.q1_end}"`)
  })
}

diagnoseCycles()
