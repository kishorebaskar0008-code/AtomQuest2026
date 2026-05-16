export default function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Employee Dashboard</h2>
      </div>
      <p className="text-muted-foreground">Welcome back! Here is an overview of your goals and progress.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat cards will go here */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Goals</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Approved</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Pending Approval</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Weightage</div>
          <div className="text-2xl font-bold">0%</div>
        </div>
      </div>
    </div>
  )
}
