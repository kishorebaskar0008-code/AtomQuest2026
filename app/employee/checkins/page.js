export const dynamic = 'force-dynamic'

import { getApprovedGoals, getCheckIns } from './actions'
import { getActiveCycle } from '../goals/actions'
import { getCurrentQuarterInfo } from '@/lib/utils/dateHelpers'
import { CheckInForm } from '@/components/checkins/CheckInForm'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Calendar, Target, TrendingUp, MessageSquareText } from 'lucide-react'

export default async function EmployeeCheckinsPage() {
  const [goals, activeCycle] = await Promise.all([
    getApprovedGoals(),
    getActiveCycle()
  ])

  const quarterInfo = getCurrentQuarterInfo(activeCycle)
  const existingCheckIns = await getCheckIns(quarterInfo?.name)

  console.log(`[Server] Found ${goals.length} goals and ${existingCheckIns.length} check-ins for ${quarterInfo?.name}`)

  const totalScore = goals.length > 0 
    ? goals.reduce((sum, goal) => {
        const checkIn = existingCheckIns.find(c => c.goal_id === goal.id)
        const score = checkIn ? Math.min(Number(checkIn.progress_score), 100) : 0
        const weightage = Number(goal.weightage) || 0
        return sum + (score * (weightage / 100))
      }, 0).toFixed(1)
    : 0

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quarterly Check-ins</h2>
          <p className="text-muted-foreground mt-1">
            Log your actual achievement vs targets for {quarterInfo?.name}.
          </p>
        </div>
        
        <div className={`px-4 py-2 rounded-lg flex items-center gap-3 border ${quarterInfo?.isOpen ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
          <Calendar size={20} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider">
              {quarterInfo?.name} Window: {quarterInfo?.isOpen ? 'OPEN' : 'CLOSED'}
            </div>
            <div className="text-xs font-medium">
              {new Date(quarterInfo?.start).toLocaleDateString()} - {new Date(quarterInfo?.end).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {goals.length === 0 ? (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 text-center bg-white/50">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <AlertCircle size={32} className="text-gray-400" />
              </div>
              <CardTitle className="text-xl">No approved goals found</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                Your goals must be approved by your manager before you can log check-ins.
              </CardDescription>
            </Card>
          ) : (
            goals.map(goal => (
              <CheckInForm 
                key={goal.id} 
                goal={goal} 
                quarter={quarterInfo?.name}
                isOpen={quarterInfo?.isOpen}
                existingCheckIn={existingCheckIns.find(c => c.goal_id === goal.id)}
              />
            ))
          )}

          {existingCheckIns.some(c => c.manager_checked_in) && (
            <Card className="border-none shadow-sm bg-blue-50/50 border border-blue-100 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <MessageSquareText className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-blue-900">Manager's Feedback</h3>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Quarterly Performance Review</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-gray-700 leading-relaxed italic">
                    "{existingCheckIns.find(c => c.manager_checked_in)?.manager_comment}"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-black text-white overflow-hidden border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-[#FDB813]" size={24} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Quarterly Score</span>
              </div>
              <div className="text-5xl font-black mb-1">{totalScore}%</div>
              <p className="text-xs text-gray-400 font-medium">
                Average progress across all {goals.length} goals for {quarterInfo?.name}.
              </p>
              <div className="mt-6 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#FDB813] h-full transition-all duration-500" 
                  style={{ width: `${totalScore}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
              <Calendar size={16} /> Check-in Schedule
            </div>
            <div className="text-[10px] text-blue-700 space-y-3 font-medium uppercase tracking-wider">
              {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                const start = activeCycle?.[`${q.toLowerCase()}_start`];
                const end = activeCycle?.[`${q.toLowerCase()}_end`];
                return (
                  <div key={q} className={quarterInfo?.name === q ? 'bg-blue-100/50 p-2 rounded-md -mx-2' : ''}>
                    <div className="opacity-50">{q} Check-in {quarterInfo?.name === q && ' (Current)'}</div>
                    <div>
                      {start ? new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'} - 
                      {end ? new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
