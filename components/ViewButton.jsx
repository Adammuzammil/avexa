"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";

const ViewButton = () => {
  const router = useRouter();

  const handleClick = async () => {
    if (!sessionStorage.getItem("ipTracked")) {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        await fetch("/api/log-location", {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });

        sessionStorage.setItem("ipTracked", "true");
      } catch (err) {
        console.error("IP tracking failed", err);
      }
    }

    router.push("/cars");
  };
  return (
    <Button className="flex items-center cursor-pointer" onClick={handleClick}>
      View All <ChevronRight className="ml-1 h-4 w-4" />
    </Button>
  );
};

export default ViewButton;
