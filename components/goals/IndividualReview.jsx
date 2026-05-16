'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { reviewGoal } from '@/app/manager/team/actions'
import { toast } from 'sonner'
import { Loader2, CheckCircle, RotateCcw, MessageSquare } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'

export function IndividualReview({ goalId, employeeName, currentStatus }) {
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [open, setOpen] = useState(false)

  if (currentStatus !== 'submitted') return null

  async function onReview(status) {
    if (status === 'returned' && !comment.trim()) {
      toast.error('Please provide feedback before returning the goal.')
      return
    }

    setLoading(true)
    const result = await reviewGoal(goalId, status, comment)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(status === 'approved' ? 'Goal approved!' : 'Goal returned with feedback.')
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className="inline-flex items-center justify-center rounded-md text-xs font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 border border-red-200 text-red-600 hover:bg-red-50"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Return
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Goal for Revision</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-500">Provide feedback to {employeeName} on what needs to be changed.</p>
            <Textarea 
              placeholder="Enter your feedback here..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={() => onReview('returned')}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirm Return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button 
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white font-bold h-8 px-3 text-xs"
        onClick={() => onReview('approved')}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve</>}
      </Button>
    </div>
  )
}
