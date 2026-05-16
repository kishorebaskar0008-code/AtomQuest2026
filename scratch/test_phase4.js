const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Mock calculateProgressScore (since we can't easily import ES modules in CJS scratch script without setup)
function calculateProgressScore(uomType, target, actual) {
  if (actual === null || actual === undefined || actual === '') return 0;
  if (uomType !== 'timeline') {
    const targetVal = Number(target);
    const actualVal = Number(actual);
    if (isNaN(targetVal) || isNaN(actualVal)) return 0;
  }
  let score = 0;
  switch (uomType) {
    case 'numeric_min': 
      const tMin = Number(target);
      const aMin = Number(actual);
      score = tMin > 0 ? (aMin / tMin) * 100 : 0; 
      break;
    case 'numeric_max': 
      const tMax = Number(target);
      const aMax = Number(actual);
      score = aMax > 0 ? (tMax / aMax) * 100 : 0; 
      break;
    case 'timeline':
      const actualDate = new Date(actual);
      const targetDate = new Date(target);
      score = actualDate <= targetDate ? 100 : 0;
      break;
    case 'zero_based': 
      const aZero = Number(actual);
      score = aZero === 0 ? 100 : 0; 
      break;
    default: score = 0;
  }
  return Math.min(Math.max(0, Number(score.toFixed(2))), 100);
}

async function testPhase4() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('--- Phase 4: Score Calculator Logic Test ---');
  console.log('numeric_min (18/40):', calculateProgressScore('numeric_min', 40, 18), 'expected: 45');
  console.log('numeric_max (5/3):', calculateProgressScore('numeric_max', 5, 3), 'expected: 100');
  console.log('timeline (on time):', calculateProgressScore('timeline', '2025-03-31', '2025-03-30'), 'expected: 100');
  console.log('timeline (late):', calculateProgressScore('timeline', '2025-03-31', '2025-04-01'), 'expected: 0');
  console.log('zero_based (0):', calculateProgressScore('zero_based', 0, 0), 'expected: 100');
  console.log('zero_based (1):', calculateProgressScore('zero_based', 0, 1), 'expected: 0');

  console.log('\n--- Phase 4: DB Trigger Test ---');

  // 1. Get a goal
  const { data: goal } = await supabase.from('goals').select('*').limit(1).single();
  if (!goal) {
    console.log('No goal found for testing.');
    return;
  }

  // 2. Ensure goal is approved (so it can be checked in)
  await supabase.from('goals').update({ status: 'approved' }).eq('id', goal.id);

  // 3. Insert/Upsert a check-in
  console.log(`Inserting Q1 check-in for goal: ${goal.title}...`);
  const { data: checkin, error } = await supabase
    .from('check_ins')
    .upsert({
      goal_id: goal.id,
      employee_id: goal.employee_id,
      cycle_id: goal.cycle_id,
      quarter: 'Q1',
      actual_value: goal.uom_type === 'numeric_min' ? 50 : 0, // 50% of 100 if target was 100
      actual_date: goal.uom_type === 'timeline' ? '2025-01-01' : null,
      status: 'on_track'
    }, { onConflict: 'goal_id, quarter, cycle_id' })
    .select()
    .single();

  if (error) {
    console.error('Check-in failed:', error.message);
    return;
  }

  console.log('Check-in inserted. Progress Score (from DB):', checkin.progress_score);
  
  if (checkin.progress_score !== null && checkin.progress_score !== undefined) {
    console.log('SUCCESS: DB Trigger auto-calculated the score!');
  } else {
    console.log('FAILURE: DB Trigger did not calculate the score.');
  }
}

testPhase4();
