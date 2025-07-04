import { getCarFilters } from "@/actions/vehicle-info";
import React from "react";
import Filters from "./_components/Filters";
import Listings from "./_components/Listings";

export const metadata = {
  title: "Cars | Avexa",
  description: "Browse and search for your dream car",
};

const CarsPage = async () => {
  const filtersData = await getCarFilters();
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl mb-4">Browse Cars</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 shrink-0">
          <Filters filters={filtersData?.data} />
        </div>

        <div className="flex-1">
          <Listings />
        </div>
      </div>
    </div>
  );
};

export default CarsPage;
