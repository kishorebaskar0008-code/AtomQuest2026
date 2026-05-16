'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { submitManagerReview } from '@/app/manager/checkin-review/actions'
import { toast } from 'sonner'
import { Loader2, MessageSquare } from 'lucide-react'

export function ManagerReviewForm({ employeeId, employeeName, quarter, existingComment = '' }) {
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState(existingComment)

  async function handleAction() {
    if (!comment.trim()) {
      toast.error('Please enter a review comment')
      return
    }

    setLoading(true)
    const result = await submitManagerReview(employeeId, quarter, comment)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Review submitted successfully!')
    }
    setLoading(false)
  }

  return (
    <Card className="border-none shadow-lg bg-black text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="text-[#FDB813]" size={20} />
          Manager's Feedback for {quarter}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-400">Notes from the 1:1 Discussion</Label>
          <Textarea 
            className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 min-h-[120px]" 
            placeholder={`Summarize your discussion with ${employeeName.split(' ')[0]}...`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleAction} 
          disabled={loading}
          className="w-full bg-[#FDB813] hover:bg-[#E5A510] text-black font-bold"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Submit Check-in Review
        </Button>
      </CardContent>
    </Card>
  )
}
