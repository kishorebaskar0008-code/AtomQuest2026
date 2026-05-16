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
    approved: team.filter(m => m.status === 'Approved').length,
    pending: team.filter(m => m.status === 'Pending Review').length,
    draft: team.filter(m => m.status === 'Draft' || m.status === 'Not Started').length
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black">My Team</h2>
        <p className="text-muted-foreground mt-1">
          Monitor goal setting progress and review submissions from your direct reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Team" value={stats.total} icon={<Users className="text-blue-600" />} />
        <StatCard title="Approved" value={stats.approved} icon={<CheckCircle2 className="text-green-600" />} />
        <StatCard title="Pending Review" value={stats.pending} icon={<Clock className="text-yellow-600" />} />
        <StatCard title="In Progress" value={stats.draft} icon={<AlertCircle className="text-gray-400" />} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b">
          <CardTitle>Team Goal Status</CardTitle>
          <CardDescription>Click on an employee to review their goals.</CardDescription>
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
                    {member.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-black">{member.full_name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="hidden md:block text-right">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Weightage</div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            member.totalWeightage === 100 ? "bg-green-500" : "bg-[#FDB813]"
                          )}
                          style={{ width: `${member.totalWeightage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold tabular-nums">{member.totalWeightage}%</span>
                    </div>
                  </div>

                  <div className="w-32 text-right">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</div>
                    <Badge className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5",
                      member.status === 'Approved' ? "bg-green-100 text-green-700" :
                      member.status === 'Pending Review' ? "bg-yellow-100 text-yellow-700 animate-pulse" :
                      member.status === 'Draft' ? "bg-gray-100 text-gray-600" : "bg-red-50 text-red-600"
                    )}>
                      {member.status}
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
