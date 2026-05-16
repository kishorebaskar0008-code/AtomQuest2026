import { getThrustAreas, getActiveCycle, getEmployeeGoals, deleteGoal } from './actions'
import { GoalForm } from '@/components/goals/GoalForm'
import { WeightageBar } from '@/components/goals/WeightageBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, AlertCircle, Info, Target, CheckCircle2, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SubmitGoalsButton } from '@/components/goals/SubmitGoalsButton'

export default async function EmployeeGoalsPage() {
  const [thrustAreas, activeCycle, goals] = await Promise.all([
    getThrustAreas(),
    getActiveCycle(),
    getEmployeeGoals()
  ])

  const totalWeightage = goals.reduce((sum, g) => sum + Number(g.weightage), 0)
  const isAllSubmitted = goals.length > 0 && goals.every(g => g.status !== 'draft')

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Goals</h2>
          <p className="text-muted-foreground mt-1">
            Define up to 8 goals for the {activeCycle?.name || 'current'} cycle.
          </p>
        </div>
        {!isAllSubmitted && (
          <GoalForm 
            thrustAreas={thrustAreas} 
            activeCycle={activeCycle} 
            currentTotalWeightage={totalWeightage}
            goalCount={goals.length}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {goals.length === 0 ? (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 text-center bg-white/50">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Target size={32} className="text-gray-400" />
              </div>
              <CardTitle className="text-xl">No goals created yet</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                Click the "Add New Goal" button to start defining your targets for this cycle.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <Card key={goal.id} className="bg-white overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0">
                          {goal.thrust_areas?.name}
                        </Badge>
                        <Badge className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0",
                          goal.status === 'draft' ? "bg-gray-100 text-gray-600" : 
                          goal.status === 'submitted' ? "bg-yellow-100 text-yellow-700" :
                          goal.status === 'approved' ? "bg-green-100 text-green-700" : 
                          "bg-red-100 text-red-700"
                        )}>
                          {goal.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold">{goal.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {(goal.status === 'draft' || goal.status === 'returned') && (
                        <>
                          <GoalForm 
                            thrustAreas={thrustAreas}
                            activeCycle={activeCycle}
                            currentTotalWeightage={totalWeightage}
                            goalCount={goals.length}
                            initialData={goal}
                            trigger={
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                                <Pencil size={18} />
                              </Button>
                            }
                          />
                          <form action={async (formData) => {
                            'use server'
                            const id = formData.get('id')
                            await deleteGoal(id)
                          }}>
                            <input type="hidden" name="id" value={goal.id} />
                            <Button variant="ghost" size="icon" type="submit" className="text-gray-400 hover:text-red-600">
                              <Trash2 size={18} />
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {goal.description}
                    </p>
                    
                    {goal.comment && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 italic">
                        <strong>Manager Feedback:</strong> {goal.comment}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Weightage</div>
                          <div className="text-lg font-black text-black">{goal.weightage}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Target</div>
                          <div className="text-lg font-black text-black">
                            {goal.uom_type === 'timeline' 
                              ? new Date(goal.target_date).toISOString().split('T')[0] 
                              : goal.target_value}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">UOM</div>
                         <div className="text-sm font-bold text-gray-700 uppercase">{goal.uom_type.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <WeightageBar total={totalWeightage} />
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
              <Info size={16} /> Guidelines
            </div>
            <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4 font-medium">
              <li>Minimum 10% weightage per goal.</li>
              <li>Sum of all weightages must be exactly 100%.</li>
              <li>Maximum of 8 goals allowed per cycle.</li>
              <li>Goals can only be edited/deleted while in "Draft" status.</li>
            </ul>
          </div>

          {!isAllSubmitted && (
            <SubmitGoalsButton totalWeightage={totalWeightage} goalCount={goals.length} />
          )}

          {isAllSubmitted && (
             <div className="bg-green-50 border border-green-100 rounded-xl p-5 flex items-center gap-3 text-green-800 font-bold text-sm">
                <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                Goals submitted for review.
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

