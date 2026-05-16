export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <p className="text-muted-foreground">Overview of organization-wide goal setting and tracking progress.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Users</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Goal Submission Rate</div>
          <div className="text-2xl font-bold">0%</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Check-in Completion</div>
          <div className="text-2xl font-bold">0%</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Active Escalations</div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>
    </div>
  )
}
