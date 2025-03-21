"use client";

import { Button } from "@/components/ui/button";
import { Hotel } from "lucide-react";
import { useRouter } from "next/navigation";
import { HotelPlanCard } from "./hotel-plan-card";

interface HotelPlansProps {
  cityGroups: CityGroup[];
  selectedCity: string | null;
  onRemovePlan: (id: string) => Promise<void>;
  renderEmptySection: (
    title: string,
    description: string,
    icon: React.ReactNode
  ) => JSX.Element;
}

export function HotelPlans({
  cityGroups,
  selectedCity,
  onRemovePlan,
  renderEmptySection,
}: HotelPlansProps) {
  const router = useRouter();
  const filteredGroups = selectedCity
    ? cityGroups.filter((group) => group.code === selectedCity)
    : cityGroups;

  const hasHotels = filteredGroups.some((group) => group.hotels.length > 0);

  if (!hasHotels) {
    return (
      <div className="space-y-6">
        {renderEmptySection(
          "No Hotel Bookings",
          "Find and book the perfect hotel for your stay.",
          <Hotel className="h-12 w-12" />
        )}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            className="mx-auto"
            onClick={() => router.push("/hotels")}
          >
            <Hotel className="h-4 w-4 mr-2" />
            Browse Hotels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredGroups.map(
        (group) =>
          group.hotels.length > 0 && (
            <div key={group.code} className="space-y-4">
              <h3 className="font-medium text-lg text-gray-900">
                {group.city}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {group.hotels.map((plan) => (
                  <HotelPlanCard
                    key={plan.id}
                    plan={plan}
                    onRemove={() => onRemovePlan(plan.id)}
                  />
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}
