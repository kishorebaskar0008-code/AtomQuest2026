'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function WeightageBar({ total }) {
  const isOver = total > 100
  const isFull = total === 100
  
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Weightage</h3>
          <p className={cn(
            "text-4xl font-black tabular-nums",
            isOver ? "text-red-600" : isFull ? "text-green-600" : "text-black"
          )}>
            {total}%
          </p>
        </div>
        <div className="text-right text-xs font-medium text-gray-400 pb-1">
          {total < 100 ? `${100 - total}% remaining` : total === 100 ? 'Target reached' : 'Limit exceeded'}
        </div>
      </div>
      
      <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            isOver ? "bg-red-500" : isFull ? "bg-green-500" : "bg-[#FDB813]"
          )}
          style={{ width: `${Math.min(total, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
