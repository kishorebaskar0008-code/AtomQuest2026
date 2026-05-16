'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { submitGoals } from '@/app/employee/goals/actions'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

export function SubmitGoalsButton({ totalWeightage, goalCount }) {
  const [loading, setLoading] = useState(false)

  async function handleHover() {
    if (totalWeightage !== 100) {
       // Optional: logic for showing tooltips
    }
  }

  async function onClick() {
    if (totalWeightage !== 100) {
      toast.error('Total weightage must be exactly 100% before submitting.')
      return
    }

    setLoading(true)
    const result = await submitGoals()
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('All goals submitted for approval!')
    }
    setLoading(false)
  }

  const isDisabled = totalWeightage !== 100 || goalCount === 0

  return (
    <Button 
      onClick={onClick}
      disabled={isDisabled || loading}
      className="w-full h-12 bg-black text-[#FDB813] font-bold hover:bg-gray-900 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <span className="flex items-center gap-2">
          <Send size={18} />
          Submit All Goals for Approval
        </span>
      )}
    </Button>
  )
}
