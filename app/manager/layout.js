import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ManagerLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'manager') {
    if (userData?.role === 'employee') redirect('/employee/dashboard')
    if (userData?.role === 'admin') redirect('/admin/dashboard')
    redirect('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/manager/dashboard', icon: 'dashboard' },
    { label: 'Team Goals', href: '/manager/team', icon: 'team' },
    { label: 'Check-in Review', href: '/manager/checkin-review', icon: 'checkins' },
    { label: 'Shared Goals', href: '/manager/shared-goals', icon: 'shared' },
  ]

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <Sidebar items={navItems} role="manager" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userData.name} role="Manager (L1)" />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
