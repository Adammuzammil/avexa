"use client";

import { FloatingDock } from "@/components/FloatingDock";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
import { Calendar, Car, Cog, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

// Navigation items
const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Cars",
    icon: Car,
    href: "/admin/cars",
  },
  {
    label: "Test Drives",
    icon: Calendar,
    href: "/admin/test-drives",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/admin/settings",
  },
];

const floatingDockRoutes = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-full w-full" />,
    href: "/admin",
  },
  {
    title: "Cars",
    icon: <Car className="h-full w-full" />,
    href: "/admin/cars",
  },
  {
    title: "Test Drives",
    icon: <Calendar className="h-full w-full" />,
    href: "/admin/test-drives",
  },
  {
    title: "Settings",
    icon: <Cog className="h-full w-full" />,
    href: "/admin/settings",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full flex-col overflow-y-auto bg-white shadow-sm border-r">
        {/* <div className="p-6">
          <Link href="/admin">
            <h1 className="text-xl font-bold">Vehiql Admin</h1>
          </Link>
        </div> */}
        <div className="flex flex-col w-full">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-100/50",
                pathname === route.href
                  ? "text-blue-700 bg-blue-100/50 hover:bg-blue-100 hover:text-blue-700"
                  : "",
                "h-12"
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto p-6">
          <SignOutButton>
            <button className="flex items-center gap-x-2 text-slate-500 text-sm font-medium transition-all hover:text-slate-600">
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <FloatingDock
          mobileClassName="translate-y-20" // only for demo, remove for production
          items={floatingDockRoutes}
        />
      </div>
    </>
  );
};

export default Sidebar;
