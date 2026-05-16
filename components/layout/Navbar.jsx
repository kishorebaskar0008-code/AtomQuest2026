'use client'

import { Bell, User } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Navbar({ userName, role, cycleName, windowStatus }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium text-gray-500">
          Cycle: <span className="text-black">{cycleName || 'FY 2025-26'}</span>
        </div>
        <div className="h-4 w-[1px] bg-gray-200"></div>
        <div className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
          windowStatus?.isOpen ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        )}>
          {windowStatus?.name} Window {windowStatus?.isOpen ? 'Open' : 'Closed'}
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="text-gray-400 hover:text-black transition-colors relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#FDB813] rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900 leading-none">{userName}</div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tight mt-0.5">{role}</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <User size={18} className="text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  )
}
