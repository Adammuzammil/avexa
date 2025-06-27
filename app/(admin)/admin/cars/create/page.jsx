import React from "react";
import AddVehicleForm from "../_components/AddVehicleForm";

export const metadata = {
  title: "Add new Car | Avexa admin",
  description: "Add a new car to your marketplace",
};

const CreatePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cars Management</h1>
      <AddVehicleForm />
    </div>
  );
};

export default CreatePage;
