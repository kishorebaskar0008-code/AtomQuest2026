const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function seedTestGoal() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('--- Seeding Test Goal ---');

  // 1. Get a user
  const { data: user } = await supabase.from('users').select('id, manager_id').limit(1).single();
  if (!user) {
     console.log('No users found.');
     return;
  }

  // 2. Get a thrust area
  const { data: thrustArea } = await supabase.from('thrust_areas').select('id').limit(1).single();
  
  // 3. Get an active cycle
  const { data: cycle } = await supabase.from('cycles').select('id').eq('is_active', true).limit(1).single();

  if (!cycle) {
    console.log('No active cycle found. Please create one.');
    return;
  }

  // 4. Insert goal
  const { data: goal, error } = await supabase.from('goals').insert({
    employee_id: user.id,
    manager_id: user.manager_id,
    thrust_area_id: thrustArea?.id,
    cycle_id: cycle.id,
    title: 'Test Audit Goal ' + Date.now(),
    description: 'This is a test goal for audit log validation.',
    uom_type: 'numeric_min',
    target_value: 1000,
    weightage: 20,
    status: 'submitted'
  }).select().single();

  if (error) {
    console.error('Failed to seed goal:', error.message);
  } else {
    console.log('Goal seeded successfully:', goal.id);
  }
}

seedTestGoal();
