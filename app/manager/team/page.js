import { getTeamProgress } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function TeamPage() {
  const team = await getTeamProgress()

  const stats = {
    total: team.length,
    approved: team.filter(m => m.goalStatus === 'Approved').length,
    pending: team.filter(m => m.goalStatus === 'Pending Review' || m.q1Status === 'Pending Review').length,
    draft: team.filter(m => m.goalStatus === 'Draft' || m.goalStatus === 'Not Started').length
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black">My Team</h2>
        <p className="text-muted-foreground mt-1">
          Monitor goal setting progress and review quarterly submissions from your direct reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Team" value={stats.total} icon={<Users className="text-blue-600" />} />
        <StatCard title="Goals Approved" value={stats.approved} icon={<CheckCircle2 className="text-green-600" />} />
        <StatCard title="Action Required" value={stats.pending} icon={<Clock className="text-yellow-600" />} />
        <StatCard title="In Progress" value={stats.draft} icon={<AlertCircle className="text-gray-400" />} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b">
          <CardTitle>Team Status Overview</CardTitle>
          <CardDescription>Click on an employee to review their goals and quarterly progress.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {team.map((member) => (
              <Link 
                key={member.id} 
                href={`/manager/team/${member.id}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-black text-[#FDB813] flex items-center justify-center font-bold text-lg">
                    {member.name.charAt(0)}{member.name.split(' ').length > 1 ? member.name.split(' ')[1].charAt(0) : ''}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-black">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 lg:gap-16">
                  <div className="hidden lg:block w-32 text-right">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Goals</div>
                    <div className="text-sm font-bold text-black">{member.approvedCount} / {member.goalCount} Approved</div>
                  </div>

                  <div className="w-28 text-right">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Goal Status</div>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-none",
                      member.goalStatus === 'Approved' ? "bg-green-100 text-green-700" :
                      member.goalStatus === 'Pending Review' ? "bg-yellow-100 text-yellow-700" :
                      member.goalStatus === 'Draft' ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-600"
                    )}>
                      {member.goalStatus}
                    </Badge>
                  </div>

                  <div className="w-28 text-right">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{member.q1Name} Status</div>
                    <Badge className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5",
                      member.q1Status === 'Reviewed' ? "bg-green-600 text-white" :
                      member.q1Status === 'Pending Review' ? "bg-blue-600 text-white animate-pulse" :
                      "bg-gray-100 text-gray-400"
                    )}>
                      {member.q1Status}
                    </Badge>
                  </div>
                  
                  <ChevronRight className="text-gray-300 group-hover:text-black transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
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
