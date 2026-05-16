'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { reviewCheckIn } from '@/app/manager/team/actions'
import { toast } from 'sonner'
import { Loader2, MessageSquareText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function CheckInReview({ checkIn, goalTitle }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState(checkIn?.manager_comment || '')

  async function handleReview() {
    setLoading(true)
    const result = await reviewCheckIn(checkIn.id, comment)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Review submitted!')
      setOpen(false)
    }
    setLoading(false)
  }

  if (!checkIn) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-[10px] uppercase tracking-wider px-3")}>
          <MessageSquareText size={14} />
          {checkIn.manager_checked_in ? 'Update Review' : 'Add Review'}
        </button>
      } />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Review: <span className="text-blue-600">{goalTitle}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Achievement</div>
              <div className="text-xl font-black text-black">
                {checkIn.actual_value || checkIn.actual_date}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Calculated Score</div>
              <div className="text-xl font-black text-[#FDB813]">
                {checkIn.progress_score}%
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Employee Notes</Label>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm italic text-amber-900">
              "{checkIn.notes || 'No notes provided'}"
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-xs font-bold text-gray-500 uppercase">Your Feedback</Label>
            <Textarea 
              id="comment"
              placeholder="Provide coaching or feedback on this progress..."
              className="min-h-[120px] resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="font-bold text-xs uppercase"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReview} 
            disabled={loading}
            className="bg-[#FDB813] hover:bg-[#E5A510] text-black font-bold text-xs uppercase"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
