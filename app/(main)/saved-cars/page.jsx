import { getSavedCars } from "@/actions/vehicle-info";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SavedCarsList from "./_components/SavedCarsList";

export const metadata = {
  title: "Saved Cars | Avexa",
  description: "View your saved cars and favorites",
};

const SavedCarsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect=/saved-cars");
  }

  const savedCars = await getSavedCars();
  return (
    <div className="container mx-auto px-8 py-4">
      <h1 className="text-4xl mb-6 gradient-title">Your Saved Cars</h1>
      <SavedCarsList initialData={savedCars} />
    </div>
  );
};

export default SavedCarsPage;
