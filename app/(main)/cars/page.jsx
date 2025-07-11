import { getCarFilters } from "@/actions/vehicle-info";
import React from "react";
import Filters from "./_components/Filters";
import Listings from "./_components/Listings";
import { getVisitLogs } from "@/actions/main";
import { reverseGeoCode } from "@/lib/mapbox";

export const metadata = {
  title: "Cars | Avexa",
  description: "Browse and search for your dream car",
};

const CarsPage = async () => {
  const filtersData = await getCarFilters();
  const visitors = await getVisitLogs();

  const firstVistor = visitors.find((v) => v.latitude && v.longitude);

  let locationInfo = "";
  if (firstVistor) {
    try {
      locationInfo = await reverseGeoCode(
        firstVistor.latitude,
        firstVistor.longitude
      );
    } catch (error) {
      console.error("Reverse geocode failed:", err);
    }
  }

  return (
    <div className="container mx-auto px-4 pb-12">
      <h1 className="text-3xl mb-4">Browse Cars</h1>

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
