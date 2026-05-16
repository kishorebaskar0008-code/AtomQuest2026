'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calculateProgressScore } from '@/lib/utils/scoreCalculator'
import { submitCheckIn } from '@/app/employee/checkins/actions'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CheckInForm({ goal, existingCheckIn, quarter, isOpen }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    actual_value: existingCheckIn?.actual_value ?? '',
    actual_date: existingCheckIn?.actual_date ?? '',
    status: existingCheckIn?.status ?? 'not_started',
    notes: existingCheckIn?.notes ?? ''
  })

  const [previewScore, setPreviewScore] = useState(existingCheckIn?.progress_score || 0)

  useEffect(() => {
    console.log(`[CheckInForm] existingCheckIn for ${goal.title}:`, existingCheckIn)
    if (existingCheckIn) {
      setFormData({
        actual_value: existingCheckIn.actual_value ?? '',
        actual_date: existingCheckIn.actual_date ?? '',
        status: existingCheckIn.status ?? 'not_started',
        notes: existingCheckIn.notes ?? ''
      })
      setPreviewScore(existingCheckIn.progress_score || 0)
    }
  }, [existingCheckIn, goal.title])

  useEffect(() => {
    const target = goal.uom_type === 'timeline' ? goal.target_date : goal.target_value
    const actual = goal.uom_type === 'timeline' ? formData.actual_date : formData.actual_value
    const score = calculateProgressScore(goal.uom_type, target, actual)
    setPreviewScore(score)
  }, [formData.actual_value, formData.actual_date, goal])

  async function handleSave() {
    console.log(`[CheckInForm] Saving progress for ${goal.title}...`, formData)
    setLoading(true)
    
    // Ensure numeric value is a number, not a string
    const processedData = {
      ...formData,
      actual_value: formData.actual_value === '' ? null : Number(formData.actual_value),
      quarter,
      uom_type: goal.uom_type
    }

    const result = await submitCheckIn(goal.id, processedData)

    if (result?.error) {
      console.error('[CheckInForm] Save failed:', result.error)
      toast.error(result.error)
    } else {
      console.log('[CheckInForm] Save successful!')
      toast.success('Progress saved!')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Card className="bg-white border-none shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">{goal.title}</CardTitle>
        <div className="text-right">
           <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Projected Score</div>
           <div className={`text-lg font-black ${previewScore >= 80 ? 'text-green-600' : previewScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
             {previewScore}%
           </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target: <span className="font-bold text-black">{goal.uom_type === 'timeline' ? goal.target_date : goal.target_value}</span></Label>
              {goal.uom_type === 'timeline' ? (
                <Input 
                  type="date" 
                  value={formData.actual_date} 
                  onChange={(e) => setFormData({...formData, actual_date: e.target.value})}
                  disabled={!isOpen}
                />
              ) : (
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="Enter actual achievement"
                  value={formData.actual_value}
                  onChange={(e) => setFormData({...formData, actual_value: e.target.value})}
                  disabled={!isOpen}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData({...formData, status: val})}
                disabled={!isOpen}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="on_track">On Track</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (Context for manager)</Label>
            <Textarea 
              className="h-[115px]" 
              placeholder="How is it going?"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              disabled={!isOpen}
            />
          </div>
        </div>

        {isOpen && (
          <div className="flex justify-end pt-2">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-[#FDB813] hover:bg-[#E5A510] text-black font-bold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Progress'}
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
