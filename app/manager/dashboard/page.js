export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manager Dashboard</h2>
      </div>
      <p className="text-muted-foreground">Monitor your team's performance and manage goal approvals.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Team Members</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Pending Approval</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Check-ins Done</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Check-ins Pending</div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>
    </div>
  )
}
