const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAuditLog() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role to bypass RLS or simulate auth
  );

  console.log('--- Testing Audit Log Trigger ---');

  // 1. Find a goal that is 'submitted'
  const { data: goal, error: fetchError } = await supabase
    .from('goals')
    .select('*')
    .eq('status', 'submitted')
    .limit(1)
    .single();

  if (fetchError || !goal) {
    console.log('No submitted goal found to test with. Please ensure there is at least one goal in "submitted" status.');
    return;
  }

  console.log(`Found goal: ${goal.title} (ID: ${goal.id})`);

  // 2. Simulate manager edit and approval
  console.log('Simulating manager edit (target_value) and approval...');
  const { error: updateError } = await supabase
    .from('goals')
    .update({ 
      status: 'approved', 
      target_value: (Number(goal.target_value) || 0) + 100,
      manager_comment: 'Increasing target as discussed.' 
    })
    .eq('id', goal.id);

  if (updateError) {
    console.error('Update failed:', updateError.message);
    return;
  }

  console.log('Update successful. Waiting a moment for trigger...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3. Check audit_logs
  const { data: logs, error: logError } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('goal_id', goal.id)
    .order('created_at', { ascending: false });

  if (logError) {
    console.error('Failed to fetch logs:', logError.message);
    return;
  }

  if (logs.length > 0) {
    console.log('SUCCESS: Audit log found!');
    console.log('Change Type:', logs[0].change_type);
    console.log('Reason:', logs[0].reason);
    console.log('Diff:', JSON.stringify(logs[0].new_value.target_value, null, 2));
  } else {
    console.log('FAILURE: No audit log found. Check trigger logic.');
  }
}

testAuditLog();
