import { getTeamProgress } from '@/app/manager/team/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function ManagerDashboard() {
  const team = await getTeamProgress()

  const stats = {
    total: team.length,
    approved: team.filter(m => m.status === 'Approved').length,
    pending: team.filter(m => m.status === 'Pending Review').length,
    draft: team.filter(m => m.status === 'Draft' || m.status === 'Not Started').length
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black">Manager Overview</h2>
        <p className="text-muted-foreground mt-1">Review team performance and goal submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Team Members" value={stats.total} icon={<Users className="text-blue-600" />} />
        <StatCard title="All Approved" value={stats.approved} icon={<CheckCircle2 className="text-green-600" />} />
        <StatCard title="Pending Review" value={stats.pending} icon={<Clock className="text-yellow-600" />} />
        <StatCard title="In Progress" value={stats.draft} icon={<AlertCircle className="text-gray-400" />} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Team Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {team.slice(0, 5).map(member => (
                <Link 
                  key={member.id} 
                  href={`/manager/team/${member.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-black">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.totalWeightage}% goals set</p>
                    </div>
                  </div>
                  <Badge className={member.status === 'Approved' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {member.status}
                  </Badge>
                </Link>
              ))}
              {team.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No team members found.</p>}
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
