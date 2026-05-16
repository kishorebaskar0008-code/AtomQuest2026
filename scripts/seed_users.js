const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seed() {
  const users = [
    { email: 'admin@goaltrack.com', password: 'Admin@123', name: 'System Admin', role: 'admin', dept: 'HR' },
    { email: 'manager1@goaltrack.com', password: 'Manager@123', name: 'Sales Manager 1', role: 'manager', dept: 'Sales' },
    { email: 'manager2@goaltrack.com', password: 'Manager@123', name: 'R&D Manager 2', role: 'manager', dept: 'R&D' },
    { email: 'emp1@goaltrack.com', password: 'Employee@123', name: 'Sales Rep 1', role: 'employee', dept: 'Sales', mgr: 'manager1@goaltrack.com' },
    { email: 'emp2@goaltrack.com', password: 'Employee@123', name: 'Sales Rep 2', role: 'employee', dept: 'Sales', mgr: 'manager1@goaltrack.com' },
    { email: 'emp3@goaltrack.com', password: 'Employee@123', name: 'R&D Engineer 1', role: 'employee', dept: 'R&D', mgr: 'manager2@goaltrack.com' },
    { email: 'emp4@goaltrack.com', password: 'Employee@123', name: 'R&D Engineer 2', role: 'employee', dept: 'R&D', mgr: 'manager2@goaltrack.com' },
  ]

  console.log('Starting seed...')

  const createdUsers = []

  for (const u of users) {
    console.log(`Creating ${u.email}...`)
    
    // 1. Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true
    })

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log(`User ${u.email} already exists in Auth.`)
        // Try to fetch existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(user => user.email === u.email)
        if (existingUser) {
          createdUsers.push({ ...u, id: existingUser.id })
          continue
        }
      } else {
        console.error(`Error creating ${u.email}:`, authError.message)
        continue
      }
    } else {
      createdUsers.push({ ...u, id: authData.user.id })
    }

    // 2. Insert into public.users
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: createdUsers[createdUsers.length - 1].id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.dept
      })

    if (dbError) {
      console.error(`Error inserting ${u.email} into DB:`, dbError.message)
    }
  }

  // 3. Set manager_ids
  console.log('Setting manager relationships...')
  for (const u of users) {
    if (u.mgr) {
      const employee = createdUsers.find(cu => cu.email === u.email)
      const manager = createdUsers.find(cu => cu.email === u.mgr)
      
      if (employee && manager) {
        const { error: mgrError } = await supabase
          .from('users')
          .update({ manager_id: manager.id })
          .eq('id', employee.id)
        
        if (mgrError) {
          console.error(`Error setting manager for ${u.email}:`, mgrError.message)
        }
      }
    }
  }

  console.log('Seed complete! 🚀')
}

seed()
