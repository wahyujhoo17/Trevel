"use client";

import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

interface CarPlansProps {
  renderEmptySection: (title: string, description: string, icon: React.ReactNode) => JSX.Element;
}

export function CarPlans({ renderEmptySection }: CarPlansProps) {
  return (
    <>
      {renderEmptySection(
        "No Car Rentals",
        "Book a car for convenient travel during your trip.",
        <Car className="h-12 w-12" />
      )}
      <div className="mt-4 text-center">
        <Button variant="outline" className="mx-auto">
          <Car className="h-4 w-4 mr-2" />
          Browse Car Rentals
        </Button>
      </div>
    </>
  );
}