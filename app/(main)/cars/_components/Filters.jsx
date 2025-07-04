"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Sliders, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FilterControls from "./FilterControls";

const Filters = ({ filters }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current filter values from searchParams
  const currentMake = searchParams.get("make") || "";
  const currentBodyType = searchParams.get("bodyType") || "";
  const currentFuelType = searchParams.get("fuelType") || "";
  const currentTransmission = searchParams.get("transmission") || "";
  const currentMinPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice"))
    : filters?.price.min;
  const currentMaxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice"))
    : filters?.price.max;
  const currentSortBy = searchParams.get("sortBy") || "newest";

  // Local state for filters
  const [make, setMake] = useState(currentMake);
  const [bodyType, setBodyType] = useState(currentBodyType);
  const [fuelType, setFuelType] = useState(currentFuelType);
  const [transmission, setTransmission] = useState(currentTransmission);
  const [priceRange, setPriceRange] = useState([
    currentMinPrice,
    currentMaxPrice,
  ]);
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Update local state when URL parameters change
  useEffect(() => {
    setMake(currentMake);
    setBodyType(currentBodyType);
    setFuelType(currentFuelType);
    setTransmission(currentTransmission);
    setPriceRange([currentMinPrice, currentMaxPrice]);
    setSortBy(currentSortBy);
  }, [
    currentMake,
    currentBodyType,
    currentFuelType,
    currentTransmission,
    currentMinPrice,
    currentMaxPrice,
    currentSortBy,
  ]);

  // Create an array of filter values.
  // The first four values are strings (make, bodyType, etc.)
  // which default to "" (empty string) when not selected.
  // So we can rely on truthy check to detect if they’re selected.
  //
  // For priceRange, we must compare with default values,
  // because even when untouched, the array [min, max] is truthy.
  // We only count it as active if the user has changed the range.
  const activeFilterCount = [
    make,
    bodyType,
    fuelType,
    transmission,
    currentMinPrice > filters.price.min || currentMaxPrice < filters.price.max,
  ].filter(Boolean).length;

  const currentFilters = {
    make,
    bodyType,
    fuelType,
    transmission,
    priceRange,
    priceRangeMin: filters.price.min,
    priceRangeMax: filters.price.max,
  };

  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case "make":
        setMake(value);
        break;
      case "bodyType":
        setBodyType(value);
        break;
      case "fuelType":
        setFuelType(value);
        break;
      case "transmission":
        setTransmission(value);
        break;
      case "priceRange":
        setPriceRange(value);
        break;
    }
  };
  const handleClearFilter = (filterName) => {
    handleFilterChange(filterName, "");
  };

  //Clear all filters
  const clearFilters = () => {
    setMake("");
    setBodyType("");
    setFuelType("");
    setTransmission("");
    setPriceRange([filters.price.min, filters.price.max]);
    setSortBy("newest");

    //Keep search term if exists
    //Create a new URLSearchParams object to build query string manually
    const params = new URLSearchParams();
    //Check if a 'search' keyword exists in current URL (e.g., ?search=BMW)
    const search = searchParams.get("search");
    //If a search term exists, keep it in the new query string
    if (search) params.set("search", search);

    //Convert the params object into a query string (e.g., "search=BMW")
    const query = params.toString();
    // Construct the final URL with or without query params
    // If query is not empty, append it to current pathname
    const url = query ? `${pathname}?${query}` : pathname;
    //Navigate to the updated URL (this clears all filters but keeps search)
    router.push(url);
    setIsSheetOpen(false);
  };

  // Update URL when filters change
  const applyFilters = (newSortBy = sortBy) => {
    const params = new URLSearchParams();

    if (make) params.set("make", make);
    if (bodyType) params.set("bodyType", bodyType);
    if (fuelType) params.set("fuelType", fuelType);
    if (transmission) params.set("transmission", transmission);
    if (priceRange[0] > filters.price.min)
      params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < filters.price.max)
      params.set("maxPrice", priceRange[1].toString());

    const sortValue = typeof newSortBy === "string" ? newSortBy : "newest";
    if (sortValue !== "newest") params.set("sortBy", sortValue);

    console.log("sortBy in applyFilters:", newSortBy);

    // Preserve search and page params if they exist
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    if (search) params.set("search", search);
    if (page && page !== "1") params.set("page", page);

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    router.push(url);
    setIsSheetOpen(false);
  };
  return (
    <div className="flex lg:flex-col justify-between gap-4">
      {/* Mobile filters */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center">
          <Sheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="size-4" /> Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full sm:max-w-md overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle>Are you absolutely sure?</SheetTitle>
              </SheetHeader>

              <div className="py-6">
                <FilterControls
                  filters={filters}
                  currentFilters={currentFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilter={handleClearFilter}
                />
              </div>

              <SheetFooter className="sm:justify-between flex-row pt-2 border-t space-x-4 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button type="button" onClick={applyFilters} className="flex-1">
                  Show Results
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Sort selection */}

      <Select
        value={sortBy}
        onValueChange={(value) => {
          setSortBy(value);
          // Apply filters immediately when sort changes
          applyFilters(value);
        }}
      >
        <SelectTrigger className="w-[180px] lg:w-full">
          <SelectValue>
            {sortBy === "priceAsc"
              ? "Price: Low to High"
              : sortBy === "priceDesc"
              ? "Price: High to Low"
              : "Newest"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {[
            { value: "newest", label: "Newest" },
            { value: "priceAsc", label: "Price: Low to High" },
            { value: "priceDesc", label: "Price: High to Low" },
          ].map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Desktop filters */}
      <div className="hidden lg:block sticky top-24">
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3>
              <Sliders className="size-4 mr-2" />
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-sm text-gray-600"
                onClick={clearFilters}
              >
                <X className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>

          <div className="p-4">
            <FilterControls
              filters={filters}
              currentFilters={currentFilters}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
            />
          </div>

          <div className="px-4 py-4 border-t">
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
