"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Map, Trash2 } from "lucide-react";
import Image from "next/image";
import { getAirlineInfo } from "@/utils/airlines";
import { formatLocation } from "@/utils/format";
import { PlanItem, CityGroup } from "@/types";

interface FlightPlansProps {
  cityGroups: CityGroup[];
  selectedCity: string | null;
  onRemovePlan: (planId: string) => void;
  renderEmptySection: (
    title: string,
    description: string,
    icon: React.ReactNode
  ) => JSX.Element;
}

export function FlightPlans({
  cityGroups,
  selectedCity,
  onRemovePlan,
  renderEmptySection,
}: FlightPlansProps) {
  const filteredGroups = selectedCity
    ? cityGroups.filter((group) => group.code === selectedCity)
    : cityGroups;

  if (filteredGroups.length === 0) {
    return renderEmptySection(
      "No Flight Plans Yet",
      "Start planning your journey by searching for flights and adding them to your plan.",
      <Plane className="h-12 w-12" />
    );
  }

  return (
    <div className="space-y-8">
      {filteredGroups.map((group) => (
        <div key={group.code} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" />
            {group.city}
          </h3>
          {group.flights.map((plan) => (
            <Card
              key={plan.id}
              className="group p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden shrink-0">
                    {getAirlineInfo(plan.flight.flightNumber.split(/(\d+)/)[0])
                      ?.logo ? (
                      <Image
                        src={
                          getAirlineInfo(
                            plan.flight.flightNumber.split(/(\d+)/)[0]
                          )!.logo!
                        }
                        alt={plan.flight.airline}
                        fill
                        className="object-contain rounded-full outline outline-2 outline-gray-800 shadow-sm"
                        sizes="48px"
                        priority
                      />
                    ) : (
                      <Plane className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  <div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">
                        {plan.flight.airline}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {plan.flight.flightNumber}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {plan.flight.departureDate}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-primary/5">
                        {plan.flight.cabin}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {plan.quantity}{" "}
                        {plan.quantity === 1 ? "ticket" : "tickets"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center text-gray-500 justify-end">
                      <span className="font-medium">
                        {plan.flight.departureTime}
                      </span>
                      <Plane className="h-4 w-4 mx-2 rotate-90" />
                      <span className="font-medium">
                        {plan.flight.arrivalTime}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatLocation(plan.flight.origin)} →{" "}
                      {formatLocation(plan.flight.destination)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemovePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
