'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Loader2, Pencil } from 'lucide-react'
import { createGoal, updateGoal } from '@/app/employee/goals/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function GoalForm({ 
  thrustAreas, 
  activeCycle, 
  currentTotalWeightage, 
  goalCount, 
  initialData = null,
  trigger = null
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uom, setUom] = useState(initialData?.uom_type || '')
  const [thrustAreaId, setThrustAreaId] = useState(initialData?.thrust_area_id || '')

  const isEdit = !!initialData

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
      manager_id: initialData?.manager_id || null
    }

    const result = isEdit 
      ? await updateGoal(initialData.id, data)
      : await createGoal(data)

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success(isEdit ? 'Goal updated!' : 'Goal created successfully!')
      setOpen(false)
      setLoading(false)
      if (!isEdit) {
        setUom('')
        setThrustAreaId('')
      }
    }
  }

  // Adjust remaining weightage for edit mode (don't count current goal's weightage against itself)
  const effectiveTotal = isEdit 
    ? currentTotalWeightage - Number(initialData.weightage)
    : currentTotalWeightage
  
  const remainingWeightage = 100 - effectiveTotal

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        trigger || (
          <Button
            className={cn(
              "bg-[#FDB813] hover:bg-[#E5A510] text-black font-bold",
              (goalCount >= 8 || currentTotalWeightage >= 100) && "opacity-50 cursor-not-allowed"
            )}
            disabled={goalCount >= 8 || currentTotalWeightage >= 100}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Goal
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update your goal details.' : `Define your goal for ${activeCycle?.name || 'the current cycle'}.`}
            Remaining weightage: <span className="font-bold text-black">{remainingWeightage}%</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input 
              id="title" 
              name="title" 
              defaultValue={initialData?.title}
              placeholder="Enter a clear, actionable title" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={initialData?.description}
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
                defaultValue={initialData?.weightage}
                min="10" 
                max={remainingWeightage} 
                placeholder="Min 10%" 
                required 
              />
            </div>
            
            {uom === 'timeline' ? (
              <div className="space-y-2">
                <Label htmlFor="target_date">Target Date</Label>
                <Input 
                  id="target_date" 
                  name="target_date" 
                  type="date" 
                  defaultValue={initialData?.target_date}
                  required 
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="target_value">Target Value</Label>
                <Input 
                  id="target_value" 
                  name="target_value" 
                  type="number" 
                  step="0.01" 
                  defaultValue={initialData?.target_value}
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? 'Update Goal' : 'Create Goal')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
