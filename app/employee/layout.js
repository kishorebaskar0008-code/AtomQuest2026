import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveCycle } from './goals/actions'
import { getCurrentQuarterInfo } from '@/lib/utils/dateHelpers'

export default async function EmployeeLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'employee') {
    // If they have a different role, redirect them to their own dashboard
    if (userData?.role === 'manager') redirect('/manager/dashboard')
    if (userData?.role === 'admin') redirect('/admin/dashboard')
    redirect('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/employee/dashboard', icon: 'dashboard' },
    { label: 'My Goals', href: '/employee/goals', icon: 'goals' },
    { label: 'Check-ins', href: '/employee/checkins', icon: 'checkins' },
  ]

  const activeCycle = await getActiveCycle()
  const windowStatus = getCurrentQuarterInfo(activeCycle)

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <Sidebar items={navItems} role="employee" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          userName={userData.name} 
          role="Employee" 
          cycleName={activeCycle?.name} 
          windowStatus={windowStatus}
        />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
