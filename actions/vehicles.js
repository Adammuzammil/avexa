"use server";

import { serializeCarData } from "@/lib/helpers";
import imagekit from "@/lib/imagekit";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export async function processCarImageWithAI(file) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not defined");
    }

    // Convert image file to base64
    const base64Image = await fileToBase64(file);
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    const prompt = `
      Analyze this car image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess)
      9. Short Description as to be added to a car listing

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

    // Get response from Gemini
    // Get response from Gemini
    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const carDetails = JSON.parse(cleanedText);

      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in carDetails)
      );

      if (missingFields.length > 0) {
        throw new Error(
          `AI response missing required fields: ${missingFields.join(", ")}`
        );
      }

      // Return success response with data
      return {
        success: true,
        data: carDetails,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    console.error();
    throw new Error("Gemini API error:" + error.message);
  }
}

export const addCar = async ({ carData, images }) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    //create a folder name to store images
    const carId = uuidv4();
    const folderName = `cars`;

    // Upload images to storage
    let imageUrls = [];
    let uploadPromises = [];

    // Loop through each image file
    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];

      // Skip if image data is not valid
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.warn("Skipping invalid image data");
        continue;
      }

      // Extract the base64 part (remove the data:image/xyz;base64, prefix)
      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      // Determine file extension from the data URL
      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

      // Create filename
      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderName}/${fileName}`;

      //upload to imagekit
      const uploadPromise = async () => {
        try {
          const response = await imagekit.upload({
            file: base64, // Base64 string
            fileName: fileName,
            folder: folderName, // ImageKit folder path
            useUniqueFileName: false, // We're already creating unique names
            tags: [`car-${carId}`, "car-image"], // Optional: add tags for better organization
          });

          return {
            url: response.url,
            fileId: response.fileId, // Store this for potential future deletions
            thumbnailUrl: response.thumbnailUrl || response.url,
          };
        } catch (error) {
          console.error("Error uploading image to ImageKit:", error);
          throw new Error(`Failed to upload image: ${error.message}`);
        }
      };

      uploadPromises.push(uploadPromise());
    }

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);

    if (uploadResults.length === 0) {
      throw new Error("No valid images were uploaded");
    }

    // Extract URLs and file IDs
    const imageData = uploadResults.map((result) => ({
      url: result.url,
      fileId: result.fileId,
      thumbnailUrl: result.thumbnailUrl,
    }));

    //Store the url in the database
    imageUrls = imageData.map((img) => img.url);

    // Add the car to the database
    const car = await db.car.create({
      data: {
        id: carId, // Use the same ID we used for the folder
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats,
        description: carData.description,
        status: carData.status,
        featured: carData.featured,
        images: imageUrls, // Store the array of image URLs
      },
    });

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
      carId: car.id,
      imageUrls: imageUrls,
    };
  } catch (error) {
    console.error("Error adding car:", error);
    throw new Error("Error adding car: " + error.message);
  }
};

export async function getCars(search = "") {
  try {
    // Build where conditions
    let where = {};

    // Add search filter
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute main query
    const cars = await db.car.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const serializedCars = cars.map(serializeCarData);

    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export const deleteCar = async (id) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const car = await db.car.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Delete car from database
    await db.car.delete({
      where: { id },
    });

    // Delete images from ImageKit
    try {
      const filePaths = car.images
        .map((imageUrl) => {
          //Extract file path from the url
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/cars\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      if (fileIds.length > 0) {
        const deletePromises = filePaths.map(async (filePath) => {
          try {
            // Delete by file path directly
            await imagekit.deleteFile(filePath);
            console.log(`Deleted image: ${filePath}`);
          } catch (deleteError) {
            console.error(`Error deleting image ${filePath}:`, deleteError);
          }
        });

        await Promise.allSettled(deletePromises);
      }
    } catch (storageError) {
      console.error("Error with ImageKit operations:", storageError);
    }

    revalidatePath("/admin/cars");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const updateCarStatus = async (id, { status, featured }) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    //Update the car
    await db.car.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/cars");

    return {
      success: true,
      message: "Car status updated successfully",
    };
  } catch (error) {
    console.error("Error updating car status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
