"use client"

import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { RecentEvents } from "@/components/dashboard/recent-events"
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [activities, setActivities] = useState<Array<{
    name: string
    email: string
    activity: string
    time: string
  }>>([])
  
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeUsers: 0,
    eventsToday: 0,
    activeNow: 0,
    recentCreated: [],
    recentJoined: []
  })

  const [overviewData, setOverviewData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [activitiesRes, statsRes, overviewRes] = await Promise.all([
          fetch('/api/activities/recent'),
          fetch('/api/analytics/dashboard-stats'),
          fetch('/api/analytics/overview')
        ])
        
        if (activitiesRes.ok) {
          const data = await activitiesRes.json()
          setActivities(data)
        }
        
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (overviewRes.ok) {
          const overview = await overviewRes.json()
          setOverviewData(overview)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="container mx-auto p-6 md:p-12 space-y-12">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-3xl font-light tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-muted/20 border border-muted/50 hover:bg-muted/40 transition-colors">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Events</span>
          <span className="text-5xl font-light tracking-tighter">{loading ? '-' : stats.totalEvents}</span>
        </div>
        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-muted/20 border border-muted/50 hover:bg-muted/40 transition-colors">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Participants</span>
          <span className="text-5xl font-light tracking-tighter">{loading ? '-' : stats.activeUsers}</span>
        </div>
        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-muted/20 border border-muted/50 hover:bg-muted/40 transition-colors">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Events Today</span>
          <span className="text-5xl font-light tracking-tighter">{loading ? '-' : stats.eventsToday}</span>
        </div>
        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-muted/20 border border-muted/50 hover:bg-muted/40 transition-colors">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Now</span>
          <span className="text-5xl font-light tracking-tighter">{loading ? '-' : stats.activeNow}</span>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium tracking-tight">Activity Overview</h3>
          </div>
          <div className="h-[300px] w-full rounded-2xl border border-muted/50 bg-muted/10 p-4">
            <Overview data={overviewData} />
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium tracking-tight">Recent Log</h3>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
              {loading ? '...' : `${activities.length} new`}
            </span>
          </div>
          <div className="rounded-2xl border border-muted/50 bg-muted/10 p-6">
            <RecentActivity activities={activities} loading={loading} />
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 pt-6 border-t">
        <div className="space-y-6">
          <h3 className="text-xl font-medium tracking-tight">Recently Joined Events</h3>
          <div className="rounded-2xl border border-muted/50 bg-muted/10 p-6 min-h-[200px]">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading events...</p>
            ) : (
              <RecentEvents type="joined" events={stats.recentJoined} />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-medium tracking-tight">Recently Created Events</h3>
          <div className="rounded-2xl border border-muted/50 bg-muted/10 p-6 min-h-[200px]">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading events...</p>
            ) : (
              <RecentEvents type="created" events={stats.recentCreated} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

