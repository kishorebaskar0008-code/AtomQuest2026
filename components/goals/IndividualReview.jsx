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

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function IndividualReview({ goal, employeeName }) {
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [openReturn, setOpenReturn] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  
  // Edit states
  const [editTarget, setEditTarget] = useState(goal.target_value || '')
  const [editTargetDate, setEditTargetDate] = useState(goal.target_date || '')
  const [editWeightage, setEditWeightage] = useState(goal.weightage || '')

  if (goal.status !== 'submitted') return null

  async function onReview(status, edits = {}) {
    if (status === 'returned' && !comment.trim()) {
      toast.error('Please provide feedback before returning the goal.')
      return
    }

    setLoading(true)
    const result = await reviewGoal(goal.id, status, comment, edits)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(status === 'approved' ? 'Goal approved!' : 'Goal returned with feedback.')
      setOpenReturn(false)
      setOpenEdit(false)
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      {/* Return Dialog */}
      <Dialog open={openReturn} onOpenChange={setOpenReturn}>
        <DialogTrigger render={
          <button className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 px-3 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50")}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Return
          </button>
        } />
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
            <Button variant="outline" onClick={() => setOpenReturn(false)}>Cancel</Button>
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

      {/* Edit & Approve Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogTrigger render={
          <button className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 px-3 text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50")}>
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Edit & Approve
          </button>
        } />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit & Approve Goal</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 text-left">
            <p className="text-sm text-gray-500">Adjust the target or weightage before approving. This will be logged in the audit trail.</p>
            
            <div className="space-y-2">
              <Label htmlFor="target">Target Value ({goal.uom_type.replace('_', ' ')})</Label>
              {goal.uom_type === 'timeline' ? (
                <Input 
                  type="date" 
                  value={editTargetDate} 
                  onChange={(e) => setEditTargetDate(e.target.value)} 
                />
              ) : (
                <Input 
                  type="number" 
                  value={editTarget} 
                  onChange={(e) => setEditTarget(e.target.value)} 
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightage">Weightage (%)</Label>
              <Input 
                type="number" 
                min="10" 
                max="100" 
                value={editWeightage} 
                onChange={(e) => setEditWeightage(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Manager Comment (Optional)</Label>
              <Textarea 
                placeholder="Reason for change..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={() => onReview('approved', {
                target_value: goal.uom_type !== 'timeline' ? editTarget : undefined,
                target_date: goal.uom_type === 'timeline' ? editTargetDate : undefined,
                weightage: editWeightage
              })}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Save & Approve'}
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
