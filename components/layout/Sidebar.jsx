'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Target, 
  ClipboardCheck, 
  Users, 
  Share2, 
  Settings, 
  FileBarChart, 
  History, 
  AlertTriangle,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const iconMap = {
  dashboard: LayoutDashboard,
  goals: Target,
  checkins: ClipboardCheck,
  team: Users,
  shared: Share2,
  cycles: Settings,
  reports: FileBarChart,
  audit: History,
  escalations: AlertTriangle
}

export function Sidebar({ items, role }) {
  const pathname = usePathname()
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col bg-black text-white">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-[#FDB813] text-xl font-bold italic tracking-tighter">
          GoalTrack
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-[#FDB813] text-black" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-black" : "text-gray-400 group-hover:text-white"
                )} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  )
}
