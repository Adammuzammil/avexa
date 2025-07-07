import { getCarById } from "@/actions/vehicle-info";
import { notFound } from "next/navigation";
import React from "react";
import CarDetails from "./_components/CarDetails";

export async function genereteMetadata({ params }) {
  const { id } = await params;
  const result = await getCarById(id);

  if (!result?.success) {
    return {
      title: "Car not found | Avexa",
      description: "The request car not found",
    };
  }

  const car = result?.data;
  console.log(car);

  return {
    title: `${car.year} ${car.make} ${car.model} | Avexa`,
    description: car.description.substring(0, 160),
    openGraph: {
      images: car.images?.[0] ? [car.images?.[0]] : [],
    },
  };
}

const CarDetailsPage = async ({ params }) => {
  const { id } = await params;
  const result = await getCarById(id);
  console.log(result);

  // If car not found, show 404
  if (!result.success) {
    notFound();
  }
  return (
    <div className="container mx-auto px-8 py-12">
      <CarDetails car={result.data} testDriveInfo={result.data.testDriveInfo} />
    </div>
  );
};

export default CarDetailsPage;
