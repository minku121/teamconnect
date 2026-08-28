import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import prisma from "@/app/lib/prisma"
import { redis } from "@/app/lib/redis"
import { getNotificationCacheKey } from "@/app/lib/notificationCache"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const cacheKey = getNotificationCacheKey(userId)

    // 1. Try to get from Redis Cache first
    try {
      const cachedData = await redis.get(cacheKey)
      if (cachedData) {
        const notifications = JSON.parse(cachedData)
        return NextResponse.json({ 
          notifications,
          totalCount: notifications.length,
          unreadCount: notifications.filter((n: any) => !n.read).length
        })
      }
    } catch (redisError) {
      console.error("Redis cache error:", redisError)
      // If Redis fails, continue to DB fallback
    }

    // 2. Cache Miss: Fetch from PostgreSQL
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 3. Save to Redis for next time (Cache for 1 hour = 3600 seconds)
    try {
      await redis.set(cacheKey, JSON.stringify(notifications), 'EX', 3600)
    } catch (redisError) {
      console.error("Failed to set Redis cache:", redisError)
    }

    return NextResponse.json({ 
      notifications,
      totalCount: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
