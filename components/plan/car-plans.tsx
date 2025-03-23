"use client";

import { Button } from "@/components/ui/button";
import { Toast } from "@radix-ui/react-toast";
import { Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CityGroup as PlanCityGroup } from "@/types/plans";
import { ReactElement, ReactNode } from "react";

interface CarPlansProps {
  cityGroups: PlanCityGroup[];
  selectedCity: string | null;
  onRemovePlan: (id: string) => Promise<void>;
  renderEmptySection: (
    title: string,
    description: string,
    icon: ReactNode
  ) => ReactElement;
}

export function CarPlans({
  cityGroups,
  selectedCity,
  onRemovePlan,
  renderEmptySection,
}: CarPlansProps) {
  const router = useRouter();
  const filteredGroups = selectedCity
    ? cityGroups.filter((group) => group.code === selectedCity)
    : cityGroups;

  const hasCars = filteredGroups.some((group) => group.cars.length > 0);

  if (!hasCars) {
    return (
      <div className="space-y-6">
        {renderEmptySection(
          "No Car Rentals",
          "Book a car for convenient travel during your trip.",
          <Car className="h-12 w-12" />
        )}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            className="mx-auto"
            onClick={() => toast.info("Coming soon!")} // Replace with router.push("/cars")
          >
            <Car className="h-4 w-4 mr-2" />
            Browse Car Rentals
          </Button>
        </div>
      </div>
    );
  }

  // ... rest of your existing rendering code for when there are cars
}
