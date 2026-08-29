import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Calendar, Flag, Users, PenToolIcon as Tool } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const metadata: Metadata = {
  title: "Dashboard Overview",
  description: "A personalized dashboard summarizing key information",
}

const quickTools = [
  { id: 1, name: "Event Planner", icon: Calendar, href: "/account/manage-events" },
  { id: 2, name: "Attendee Tracker", icon: Users, href: "/account/dashboard" },
  { id: 3, name: "Feedback Collector", icon: Flag, href: "#" },
]

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return <div>Please sign in to view your dashboard.</div>
  }

  const userId = Number(session.user.id)
  const userName = session.user.name || "User"

  // Fetch real data
  const userStats = await prisma.user.findUnique({
    where: { id: userId },
    select: { eventsJoined: true, eventsCreated: true }
  })

  const upcomingEvents = await prisma.event.findMany({
    where: {
      OR: [
        { createdById: userId },
        { attendees: { some: { userId } } }
      ],
      startTime: { gt: new Date() }
    },
    orderBy: { startTime: "asc" },
    take: 3
  })

  const recentActivity = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3
  })

  const eventsJoined = userStats?.eventsJoined || 0;
  const eventsManaged = userStats?.eventsCreated || 0;
  const recentReports = 0; // Or fetch from a reports table if it exists

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {userName}!</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Joined</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsJoined}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Managed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsManaged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Reports/Issues</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentReports}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity found.</p>
            ) : (
              <ul className="space-y-4">
                {recentActivity.map((activity) => {
                  let typeStr = "ACT";
                  if (activity.type === "EVENT_JOINED") typeStr = "J";
                  else if (activity.type === "EVENT_CREATION") typeStr = "C";
                  else if (activity.type === "EVENT_EDIT") typeStr = "E";
                  
                  return (
                    <li key={activity.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{typeStr}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.description}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.createdAt.toLocaleString()}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            ) : (
              <ul className="space-y-4">
                {upcomingEvents.map((event) => (
                  <li key={event.id} className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium leading-none">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{event.startTime.toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Quick Access</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {quickTools.map((tool) => (
          <Button key={tool.id} variant="outline" asChild className="w-full">
            <Link href={tool.href}>
              <tool.icon className="mr-2 h-4 w-4" />
              {tool.name}
            </Link>
          </Button>
        ))}
        <Button variant="outline" asChild className="w-full">
          <Link href="/account/settings">
            <Tool className="mr-2 h-4 w-4" />
            More Tools
          </Link>
        </Button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild className="w-full">
          <Link href="/account/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/account/manage-events">
            Manage Events
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/account/events">
            Join Events
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/account/settings">
            Account Settings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
