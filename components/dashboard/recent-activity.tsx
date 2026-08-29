"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function RecentActivity({ activities, loading }: { 
  activities: Array<{
    name: string
    email: string
    activity: string
    time: string
  }>
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-6 border-l border-muted/30 ml-3 pl-6">
        {[...Array(3)].map((_, index) => (
          <div className="relative space-y-2 -mt-2 mb-8" key={index}>
            <div className="absolute left-[-42px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-muted/30">
               <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="p-4 rounded-2xl border border-muted/50 bg-muted/10 space-y-3">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No recent activity found.</p>;
  }

  return (
    <div className="relative border-l border-muted/30 ml-4 space-y-6 py-2">
      {activities.map((activity, index) => (
        <div className="relative flex items-start gap-4 pl-6" key={index}>
          <div className="absolute left-[-17px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm border border-muted/50 text-xs font-semibold text-primary">
            {activity.name.charAt(0)}
          </div>
          <div className="flex-1 space-y-2 bg-muted/10 hover:bg-muted/30 transition-all duration-300 p-4 rounded-2xl border border-muted/50 -mt-2 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-tight text-foreground">{activity.name}</p>
              <span className="text-xs text-muted-foreground/80 font-mono">{activity.time}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activity.activity}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

