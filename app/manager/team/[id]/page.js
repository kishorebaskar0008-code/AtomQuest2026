import { getEmployeeGoalsForManager, getUserProfile, getEmployeeCheckInsForManager } from '../actions'
import { getActiveCycle } from '@/app/employee/goals/actions'
import { getCurrentQuarterInfo } from '@/lib/utils/dateHelpers'
import { ReviewActions } from '@/components/goals/ReviewActions'
import { IndividualReview } from '@/components/goals/IndividualReview'
import { CheckInReview } from '@/components/goals/CheckInReview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowLeft, Target, Calendar, BarChart3, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function EmployeeReviewPage({ params }) {
  const { id } = await params
  const [employee, goals, activeCycle] = await Promise.all([
    getUserProfile(id),
    getEmployeeGoalsForManager(id),
    getActiveCycle()
  ])

  const quarterInfo = getCurrentQuarterInfo(activeCycle)
  const checkIns = await getEmployeeCheckInsForManager(id, quarterInfo?.name)

  const totalWeightage = goals.reduce((sum, g) => sum + Number(g.weightage), 0)
  const isPendingReview = goals.length > 0 && goals.some(g => g.status === 'submitted')

  // Calculate Quarterly Score
  const totalQuarterlyScore = goals.length > 0 
    ? (goals.reduce((sum, goal) => {
        const checkIn = checkIns.find(c => c.goal_id === goal.id)
        const score = checkIn ? Math.min(Number(checkIn.progress_score), 100) : 0
        return sum + score
      }, 0) / goals.length).toFixed(1)
    : 0

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/manager/team" 
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-black">{employee.name}</h2>
          <p className="text-muted-foreground mt-1">Reviewing goals for {employee.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="bg-white border-none shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-bold uppercase tracking-wider">
                      {goal.thrust_areas?.name}
                    </Badge>
                    <Badge className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5",
                      goal.status === 'approved' ? "bg-green-100 text-green-700" :
                      goal.status === 'submitted' ? "bg-yellow-100 text-yellow-700" :
                      goal.status === 'draft' ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-600"
                    )}>
                      {goal.status}
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-bold">{goal.title}</CardTitle>
                    <div className="flex items-center gap-3 shrink-0">
                      {checkIns.find(c => c.goal_id === goal.id) && (
                        <CheckInReview 
                          checkIn={checkIns.find(c => c.goal_id === goal.id)} 
                          goalTitle={goal.title}
                        />
                      )}
                      <IndividualReview 
                        goal={goal} 
                        employeeName={employee.name} 
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {checkIns.find(c => c.goal_id === goal.id) && (
                    <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs">
                          {Math.min(checkIns.find(c => c.goal_id === goal.id).progress_score, 100)}%
                        </div>
                        <div>
                          <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Q1 Progress</div>
                          <div className="text-xs font-medium text-blue-900 truncate max-w-[200px]">
                            {checkIns.find(c => c.goal_id === goal.id).notes || 'No notes'}
                          </div>
                        </div>
                      </div>
                      {checkIns.find(c => c.goal_id === goal.id).manager_checked_in && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[9px]">Reviewed</Badge>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {goal.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                        <BarChart3 size={10} /> Weightage
                      </div>
                      <div className="text-lg font-black text-black">{goal.weightage}%</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                        <Target size={10} /> Target
                      </div>
                      <div className="text-lg font-black text-black">
                        {goal.uom_type === 'timeline' 
                          ? new Date(goal.target_date).toISOString().split('T')[0] 
                          : goal.target_value}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">UOM</div>
                      <div className="text-sm font-bold text-gray-700 uppercase">{goal.uom_type.replace('_', ' ')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-black text-white overflow-hidden border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-[#FDB813]" size={24} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Quarterly Score</span>
              </div>
              <div className="text-5xl font-black mb-1">{totalQuarterlyScore}%</div>
              <p className="text-xs text-gray-400 font-medium">
                Average progress for {quarterInfo?.name}.
              </p>
              <div className="mt-6 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#FDB813] h-full transition-all duration-500" 
                  style={{ width: `${totalQuarterlyScore}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Goal Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-gray-500">Total Weightage</span>
                <span className={cn(
                  "text-2xl font-black",
                  totalWeightage === 100 ? "text-green-600" : "text-black"
                )}>{totalWeightage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    totalWeightage === 100 ? "bg-green-500" : "bg-[#FDB813]"
                  )}
                  style={{ width: `${totalWeightage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Goal Count</span>
                <span className="font-bold">{goals.length} / 8</span>
              </div>
            </div>
          </div>

          <ReviewActions 
            employeeId={id} 
            employeeName={employee.name}
            isPending={isPendingReview}
          />

          {!isPendingReview && goals.length > 0 && (
             <div className={cn(
               "p-5 rounded-xl border flex items-center gap-3 font-bold text-sm",
               goals.every(g => g.status === 'approved') ? "bg-green-50 border-green-100 text-green-800" : "bg-gray-50 border-gray-100 text-gray-600"
             )}>
                {goals.every(g => g.status === 'approved') ? (
                  <>
                    <CheckCircle className="text-green-600 shrink-0" size={20} />
                    All goals are approved.
                  </>
                ) : (
                  <>
                    <Info className="text-gray-400 shrink-0" size={20} />
                    Waiting for employee to submit goals.
                  </>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckCircle({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function Info({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}
