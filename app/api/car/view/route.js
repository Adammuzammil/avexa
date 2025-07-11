import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { carId } = await req.json();

    if (!carId) {
      return NextResponse.json(
        { success: false, error: "Missing carId" },
        { status: 400 }
      );
    }

    await db.car.update({
      where: { id: carId },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CAR_VIEW_INCREMENT]", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
