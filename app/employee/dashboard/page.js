import { getEmployeeGoals, getActiveCycle } from '@/app/employee/goals/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function EmployeeDashboard() {
  const [goals, activeCycle] = await Promise.all([
    getEmployeeGoals(),
    getActiveCycle()
  ])

  const totalWeightage = goals.reduce((sum, g) => sum + Number(g.weightage), 0)
  const pendingGoals = goals.filter(g => g.status === 'submitted').length
  const approvedGoals = goals.filter(g => g.status === 'approved').length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black">Welcome Back!</h2>
        <p className="text-muted-foreground mt-1">
          You are currently in the <strong>{activeCycle?.name || 'Annual'}</strong> performance cycle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="My Goals" value={goals.length} icon={<Target className="text-blue-600" />} />
        <StatCard title="Total Weightage" value={`${totalWeightage}%`} icon={<TrendingUp className="text-green-600" />} />
        <StatCard title="Pending Review" value={pendingGoals} icon={<Clock className="text-yellow-600" />} />
        <StatCard title="Approved" value={approvedGoals} icon={<CheckCircle2 className="text-green-600" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.slice(0, 3).map(goal => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-bold text-sm">{goal.title}</p>
                    <p className="text-xs text-gray-500">{goal.weightage}% weightage</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {goal.status}
                  </Badge>
                </div>
              ))}
              {goals.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No goals created yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black mt-1">{value}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
