import { PrismaClient } from "@prisma/client";
import { invalidateMultipleUsersCache } from "@/app/lib/notificationCache";

const prisma = new PrismaClient();
export async function handle() {
  const events = await prisma.event.findMany({
    where: {
      status: "ACTIVE",
      endTime: { lte: new Date() }
    },
    include: {
      participants: {
        select: { id: true }
      }
    }
  });

  for (const event of events) {
    await prisma.event.update({
      where: { id: event.id },
      data: { status: "ENDED" }
    });
    
    if (event.participants.length > 0) {
      await prisma.notification.createMany({
        data: event.participants.map(p => ({
          userId: p.id,
          type: "OTHER", // Adjusted because EVENT_ENDED is not in NotificationType enum based on schema
          message: `Event "${event.name}" has automatically ended`
        }))
      });
      
      const userIds = event.participants.map(p => p.id);
      await invalidateMultipleUsersCache(userIds);
    }
  }
} 