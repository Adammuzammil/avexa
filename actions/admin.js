"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getAdmin() {
  const { userId } = await auth();
  console.log(userId);
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  console.log(user);

  // If user not found in our db or not an admin, return not authorized
  if (!user || user.role !== "ADMIN") {
    return { authorized: false, reason: "not-admin" };
  }

  return { authorized: true, user };
}

export const getDashboardData = async () => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    //fetch all
    const [cars, testDrives] = await Promise.all([
      db.car.findMany({
        select: {
          id: true,
          status: true,
          featured: true,
        },
      }),

      // Get all test drives with minimal fields
      db.testDriveBooking.findMany({
        select: {
          id: true,
          status: true,
          carId: true,
        },
      }),
    ]);

    // Calculate car statistics
    const totalCars = cars.length;
    const availableCars = cars.filter(
      (car) => car.status === "AVAILABLE"
    ).length;
    const soldCars = cars.filter((car) => car.status === "SOLD").length;
    const unavailableCars = cars.filter(
      (car) => car.status === "UNAVAILABLE"
    ).length;
    const featuredCars = cars.filter((car) => car.featured === true).length;

    // Calculate test drive statistics
    const totalTestDrives = testDrives.length;
    const pendingTestDrives = testDrives.filter(
      (td) => td.status === "PENDING"
    ).length;
    const confirmedTestDrives = testDrives.filter(
      (td) => td.status === "CONFIRMED"
    ).length;
    const completedTestDrives = testDrives.filter(
      (td) => td.status === "COMPLETED"
    ).length;
    const cancelledTestDrives = testDrives.filter(
      (td) => td.status === "CANCELLED"
    ).length;
    const noShowTestDrives = testDrives.filter(
      (td) => td.status === "NO_SHOW"
    ).length;

    // Calculate test drive conversion rate
    const completedTestDriveCarIds = testDrives
      .filter((td) => td.status === "COMPLETED")
      .map((td) => td.carId);

    const soldCarsAfterTestDrive = cars.filter(
      (car) =>
        car.status === "SOLD" && completedTestDriveCarIds.includes(car.id)
    ).length;

    const conversionRate =
      completedTestDrives > 0
        ? (soldCarsAfterTestDrive / completedTestDrives) * 100
        : 0;

    return {
      success: true,
      data: {
        cars: {
          total: totalCars,
          available: availableCars,
          sold: soldCars,
          unavailable: unavailableCars,
          featured: featuredCars,
        },
        testDrives: {
          total: totalTestDrives,
          pending: pendingTestDrives,
          confirmed: confirmedTestDrives,
          completed: completedTestDrives,
          cancelled: cancelledTestDrives,
          noShow: noShowTestDrives,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
