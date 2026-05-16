import { getEmployeeCheckIns } from '../actions'
import { getActiveCycle } from '@/app/employee/goals/actions'
import { getUserProfile } from '@/app/manager/team/actions'
import { getCurrentQuarterInfo } from '@/lib/utils/dateHelpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ManagerReviewForm } from '@/components/checkins/ManagerReviewForm'
import Link from 'next/link'
import { ArrowLeft, Target, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function IndividualCheckinReviewPage({ params }) {
  const { id } = await params
  const [activeCycle, profile] = await Promise.all([
    getActiveCycle(),
    getUserProfile(id)
  ])

  const quarterInfo = getCurrentQuarterInfo(activeCycle)
  const data = await getEmployeeCheckIns(id, quarterInfo?.name)

  const overallScore = data.length > 0 
    ? (data.reduce((sum, item) => sum + Number(item.checkIn?.progress_score || 0), 0) / data.length).toFixed(1)
    : 0

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/manager/checkin-review" />} nativeButton={false} className="rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{profile.name}</h2>
          <p className="text-muted-foreground mt-1">
            Reviewing {quarterInfo?.name} performance check-in.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Target className="text-black" size={20} />
                Planned vs Actual
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50/30">
                  <tr>
                    <th className="px-6 py-4 font-bold">Goal</th>
                    <th className="px-6 py-4 font-bold text-center">Planned</th>
                    <th className="px-6 py-4 font-bold text-center">Actual</th>
                    <th className="px-6 py-4 font-bold text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-black">{item.title}</div>
                        <div className="text-[10px] text-gray-400 uppercase mt-0.5">{item.thrust_areas?.name}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-600">
                        {item.uom_type === 'timeline' ? item.target_date : item.target_value}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.checkIn ? (
                          <div className="font-bold text-black">
                            {item.uom_type === 'timeline' ? item.checkIn.actual_date : item.checkIn.actual_value}
                          </div>
                        ) : (
                          <span className="text-gray-300 italic">No update</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <Badge className={cn(
                           "font-black text-xs",
                           Number(item.checkIn?.progress_score || 0) >= 80 ? "bg-green-100 text-green-700" :
                           Number(item.checkIn?.progress_score || 0) >= 50 ? "bg-yellow-100 text-yellow-700" :
                           "bg-red-100 text-red-700"
                         )}>
                           {item.checkIn?.progress_score || 0}%
                         </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {data.some(i => i.checkIn?.notes) && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Employee Notes</h4>
              {data.filter(i => i.checkIn?.notes).map(item => (
                <Card key={`note-${item.id}`} className="border-none shadow-sm bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">{item.title}</div>
                    <p className="text-sm text-blue-900 italic">"{item.checkIn.notes}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-[#FDB813] text-black overflow-hidden border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp size={24} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Overall Achievement</span>
              </div>
              <div className="text-5xl font-black mb-1">{overallScore}%</div>
              <p className="text-xs font-bold opacity-60">
                Average across all approved goals for {quarterInfo?.name}.
              </p>
            </CardContent>
          </Card>

          <ManagerReviewForm 
            employeeId={id} 
            employeeName={profile.name} 
            quarter={quarterInfo?.name} 
            existingComment={data.find(i => i.checkIn?.manager_comment)?.checkIn?.manager_comment}
          />
          
          <div className="bg-white border rounded-xl p-5 space-y-3 shadow-sm">
             <div className="flex items-center gap-2 text-black font-bold text-sm">
                <AlertCircle size={16} /> Review Guidelines
             </div>
             <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4 font-medium">
                <li>Compare Actual vs Planned achievement carefully.</li>
                <li>Check the "Employee Notes" for any context on delays.</li>
                <li>Provide constructive feedback in the 1:1 summary.</li>
                <li>Once submitted, the check-in will be marked as "Done".</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
