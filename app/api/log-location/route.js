import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const userInfo = await currentUser();

    let userId = null;

    if (userInfo) {
      const user = await db.user.findUnique({
        where: { clerkUserId: userInfo.id },
        select: { id: true },
      });

      userId = user?.id ?? null;
    }

    const existing = await db.visitLog.findFirst({
      where: {
        ip: body.ip,
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24), // within 1 day
        },
      },
    });

    if (existing) {
      return NextResponse.json({ alreadyExists: true });
    }
    await db.visitLog.create({
      data: {
        userId,
        ip: body.ip,
        city: body.city,
        region: body.region,
        country: body.country_name,
        currency: body.currency,
        latitude: body.latitude,
        longitude: body.longitude,
        timezone: body.timezone,
        userAgent: req.headers.get("user-agent") || "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging location:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
