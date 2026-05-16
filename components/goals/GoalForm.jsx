'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { createGoal } from '@/app/employee/goals/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function GoalForm({ thrustAreas, activeCycle, currentTotalWeightage, goalCount }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uom, setUom] = useState('')
  const [thrustAreaId, setThrustAreaId] = useState('')

  async function onSubmit(event) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      thrust_area_id: thrustAreaId,
      uom_type: uom,
      weightage: formData.get('weightage'),
      target_value: formData.get('target_value'),
      target_date: formData.get('target_date'),
      cycle_id: activeCycle?.id,
      manager_id: null
    }

    const result = await createGoal(data)

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Goal created successfully!')
      setOpen(false)
      setLoading(false)
      setUom('')
      setThrustAreaId('')
    }
  }

  const remainingWeightage = 100 - currentTotalWeightage

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-[#FDB813] hover:bg-[#E5A510] text-black",
          (goalCount >= 8 || currentTotalWeightage >= 100) && "opacity-50 cursor-not-allowed"
        )}
        disabled={goalCount >= 8 || currentTotalWeightage >= 100}
      >
        <Plus className="mr-2 h-4 w-4" /> Add New Goal
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Define your goal for {activeCycle?.name || 'the current cycle'}. 
            Remaining weightage: <span className="font-bold text-black">{remainingWeightage}%</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input id="title" name="title" placeholder="Enter a clear, actionable title" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Provide more details about your goal" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thrust Area</Label>
              <Select onValueChange={setThrustAreaId} value={thrustAreaId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select area">
                    {thrustAreaId ? thrustAreas.find(a => a.id === thrustAreaId)?.name : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {thrustAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>UoM Type</Label>
              <Select onValueChange={setUom} value={uom} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select UoM">
                    {uom === 'numeric_min' ? 'Numeric (Min)' : 
                     uom === 'numeric_max' ? 'Numeric (Max)' : 
                     uom === 'timeline' ? 'Timeline (Date)' : 
                     uom === 'zero_based' ? 'Zero-Based (0/1)' : 
                     undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numeric_min">Numeric (Min)</SelectItem>
                  <SelectItem value="numeric_max">Numeric (Max)</SelectItem>
                  <SelectItem value="timeline">Timeline (Date)</SelectItem>
                  <SelectItem value="zero_based">Zero-Based (0/1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weightage">Weightage (%)</Label>
              <Input 
                id="weightage" 
                name="weightage" 
                type="number" 
                min="10" 
                max={remainingWeightage} 
                placeholder="Min 10%" 
                required 
              />
            </div>
            
            {uom === 'timeline' ? (
              <div className="space-y-2">
                <Label htmlFor="target_date">Target Date</Label>
                <Input id="target_date" name="target_date" type="date" required />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="target_value">Target Value</Label>
                <Input 
                  id="target_value" 
                  name="target_value" 
                  type="number" 
                  step="0.01" 
                  placeholder={uom === 'zero_based' ? 'e.g. 0' : 'e.g. 100'} 
                  required 
                />
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-[#FDB813] hover:bg-[#E5A510] text-black font-bold"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
