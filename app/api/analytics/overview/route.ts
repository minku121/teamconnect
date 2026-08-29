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

    // Group events created by month for the current year
    const currentYear = new Date().getFullYear();
    const events = await prisma.event.findMany({
      where: {
        createdById: userId,
        createdAt: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
      },
      select: {
        createdAt: true,
      },
    });

    const monthlyCounts = Array(12).fill(0);
    events.forEach((event) => {
      const month = event.createdAt.getMonth(); // 0-indexed
      monthlyCounts[month] += 1;
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const overviewData = months.map((name, index) => ({
      name,
      total: monthlyCounts[index],
    }));

    return NextResponse.json(overviewData);
  } catch (error) {
    console.error("Error fetching overview analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
