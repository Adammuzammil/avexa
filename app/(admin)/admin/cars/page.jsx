import React from "react";
import VehicleList from "./_components/VehicleList";

export const metadata = {
  title: "Cars | Avexa admin",
  description: "Manage cars in your marketplace",
};

const CarsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cars Management</h1>
      <VehicleList />
    </div>
  );
};

export default CarsPage;
