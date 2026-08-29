import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(token.id);

    // Total Events created by the user
    const totalEvents = await prisma.event.count({
      where: { createdById: userId }
    });

    // Active Users - meaning total participants across all events created by user
    const events = await prisma.event.findMany({
      where: { createdById: userId },
      select: { participantCount: true }
    });
    const activeUsers = events.reduce((sum, e) => sum + e.participantCount, 0);

    // Events Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventsToday = await prisma.event.count({
      where: {
        createdById: userId,
        startTime: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Active Now (meetingStarted is true)
    const activeNow = await prisma.event.count({
      where: {
        createdById: userId,
        meetingStarted: true
      }
    });

    // Recent Created Events
    const recentCreated = await prisma.event.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        name: true,
        participantCount: true,
        startTime: true,
      }
    });

    // Recent Joined Events
    const recentJoined = await prisma.event.findMany({
      where: { attendees: { some: { userId } } },
      orderBy: { startTime: 'desc' },
      take: 3,
      select: {
        name: true,
        createdBy: { select: { name: true } },
        startTime: true,
      }
    });

    const formattedCreated = recentCreated.map(e => ({
      name: e.name,
      maxParticipants: e.participantCount,
      date: e.startTime.toISOString()
    }));

    const formattedJoined = recentJoined.map(e => ({
      name: e.name,
      organizer: e.createdBy.name || "Unknown",
      date: e.startTime.toISOString()
    }));

    return NextResponse.json({
      totalEvents,
      activeUsers,
      eventsToday,
      activeNow,
      recentCreated: formattedCreated,
      recentJoined: formattedJoined
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
