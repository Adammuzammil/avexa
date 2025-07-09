"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const bookTestDrive = async ({
  carId,
  bookingDate,
  startTime,
  endTime,
  notes,
}) => {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error("Must be logged in to book a test drive");

    // Find user in db
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    //check if car exists and is available
    const car = await db.car.findUnique({
      where: { id: carId, status: "AVAILABLE" },
    });

    if (!car) throw new Error("Car not found or not available");

    //check if slot is already booked
    const existingBooking = await db.testDriveBooking.findFirst({
      where: {
        carId,
        bookingDate: new Date(bookingDate),
        startTime,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      throw new Error(
        "This time slot is already booked. Please select another time."
      );
    }

    //Create booking
    const booking = await db.testDriveBooking.create({
      data: {
        carId,
        userId: user.id,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        status: "PENDING",
        notes: notes || null,
      },
    });

    revalidatePath(`/test-drive/${carId}`);
    revalidatePath(`/cars/${carId}`);

    return {
      success: true,
      message: "Test drive booking created successfully",
      data: booking,
    };
  } catch (error) {
    console.error("Error booking test drive:", error);
    return {
      success: false,
      error: error.message || "Failed to book test drive",
    };
  }
};

export const cancelTestDrive = async (bookingId) => {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error("Must be logged in to book a test drive");

    // Find user in db
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    //Get booking
    const booking = await db.testDriveBooking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    //check if the user is the person who owns the booking
    if (booking.userId !== user.id || user.role !== "ADMIN") {
      return {
        success: false,
        error: "You are not authorized to cancel this booking",
      };
    }

    // check if the booking is cancelled
    if (booking.status === "CANCELLED") {
      return {
        success: false,
        error: "This booking has already been cancelled",
      };
    }

    if (booking.status === "COMPLETED") {
      return {
        success: false,
        error: "This booking has already been completed",
      };
    }

    //Cancel booking
    await db.testDriveBooking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    // Revalidate paths
    revalidatePath("/reservations");
    revalidatePath("/admin/test-drives");

    return {
      success: true,
      message: "Test drive cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling test drive:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getUserBooking = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the user from our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // fetch bookings
    const bookings = await db.testDriveBooking.findMany({
      where: {
        userId: user.id,
      },
      include: {
        car: true,
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    //format the fetched bookings
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializeCarData(booking.car),
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error("Error fetching test drives:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
