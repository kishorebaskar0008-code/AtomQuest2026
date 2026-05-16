'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { approveAllGoals, returnGoals } from '@/app/manager/team/actions'
import { toast } from 'sonner'
import { Loader2, CheckCircle, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ReviewActions({ employeeId, employeeName, isPending }) {
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState('')
  const router = useRouter()

  async function onApprove() {
    setLoading(true)
    const result = await approveAllGoals(employeeId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Goals for ${employeeName} approved!`)
      router.refresh()
    }
    setLoading(false)
  }

  async function onReturn() {
    if (!comment.trim()) {
      toast.error('Please provide feedback before returning goals.')
      return
    }

    setLoading(true)
    const result = await returnGoals(employeeId, comment)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Goals returned to ${employeeName} with feedback.`)
      router.push('/manager/team')
    }
    setLoading(false)
  }

  if (!isPending) return null

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
      <h3 className="font-bold text-lg">Review Actions</h3>
      
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Feedback / Comments</label>
        <Textarea 
          placeholder="Required if returning goals..." 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={onReturn}
          disabled={loading}
          className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><RotateCcw className="mr-2 h-4 w-4" /> Return</>}
        </Button>
        <Button 
          onClick={onApprove}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2 h-4 w-4" /> Approve All</>}
        </Button>
      </div>
    </div>
  )
}
