import { getTeamProgress } from '../team/actions'
import { getActiveCycle } from '../../employee/goals/actions'
import { getCurrentQuarterInfo } from '@/lib/utils/dateHelpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { ChevronRight, Calendar, CheckCircle2, Clock } from 'lucide-react'

export default async function ManagerCheckinReviewPage() {
  const [team, activeCycle] = await Promise.all([
    getTeamProgress(),
    getActiveCycle()
  ])

  const quarterInfo = getCurrentQuarterInfo(activeCycle)

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Check-in Review</h2>
          <p className="text-muted-foreground mt-1">
            Review quarterly progress and provide feedback for {quarterInfo?.name}.
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-lg border flex items-center gap-3">
          <Calendar className="text-[#FDB813]" size={20} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Window</div>
            <div className="text-sm font-bold text-black">{quarterInfo?.name} Review</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {team.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-gray-100">
                    <AvatarFallback className="bg-black text-white font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Goals</div>
                    <div className="text-sm font-bold text-black">{member.goalCount} Approved</div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Q1 Status</div>
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                      Pending Review
                    </Badge>
                  </div>

                  <Button 
                    render={<Link href={`/manager/checkin-review/${member.id}`} />}
                    className="bg-black hover:bg-gray-800 text-white font-bold"
                  >
                    Review Progress <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
