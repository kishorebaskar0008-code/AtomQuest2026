import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    if (userData?.role === 'employee') redirect('/employee/dashboard')
    if (userData?.role === 'manager') redirect('/manager/dashboard')
    redirect('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Cycles', href: '/admin/cycles', icon: 'cycles' },
    { label: 'Users', href: '/admin/users', icon: 'team' },
    { label: 'Reports', href: '/admin/reports', icon: 'reports' },
    { label: 'Audit Trail', href: '/admin/audit', icon: 'audit' },
    { label: 'Escalations', href: '/admin/escalations', icon: 'escalations' },
  ]

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <Sidebar items={navItems} role="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userName={userData.name} role="System Admin" />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
