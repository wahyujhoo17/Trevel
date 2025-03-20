"use client";

import { Button } from "@/components/ui/button";
import { Hotel } from "lucide-react";

interface HotelPlansProps {
  renderEmptySection: (title: string, description: string, icon: React.ReactNode) => JSX.Element;
}

export function HotelPlans({ renderEmptySection }: HotelPlansProps) {
  return (
    <>
      {renderEmptySection(
        "No Hotel Bookings",
        "Find and book the perfect accommodation for your trip.",
        <Hotel className="h-12 w-12" />
      )}
      <div className="mt-4 text-center">
        <Button variant="outline" className="mx-auto">
          <Hotel className="h-4 w-4 mr-2" />
          Search Hotels
        </Button>
      </div>
    </>
  );
}