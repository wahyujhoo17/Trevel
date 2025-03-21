"use client";

import { useState } from "react"; // Add this import
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Map, Trash2, Plus } from "lucide-react"; // Add this import
import Image from "next/image";
import { getAirlineInfo } from "@/utils/airlines";
import { formatLocation } from "@/utils/format";
import { PlanItem, CityGroup } from "@/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// Add BookingDetails interface
interface BookingDetails {
  basePrice: number;
  appFee: number;
  tax: number;
  total: number;
}

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
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const router = useRouter();

  const filteredGroups = selectedCity
    ? cityGroups.filter((group) => group.code === selectedCity)
    : cityGroups;

  const calculateBookingDetails = (
    price: number,
    quantity: number
  ): BookingDetails => {
    const basePrice = price * quantity;
    const appFee = basePrice * 0.01; // 1% app fee`
    const tax = basePrice * 0.11; // 11% tax
    const total = basePrice + appFee + tax;

    return {
      basePrice,
      appFee,
      tax,
      total,
    };
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const PriceBreakdown = ({ plan }: { plan: PlanItem }) => {
    const bookingDetails = calculateBookingDetails(
      plan.flight.price,
      plan.quantity
    );

    return (
      <div className="card-price-breakdown space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Base Price ({plan.quantity} tickets)</span>
          <span className="font-medium">
            {formatPrice(bookingDetails.basePrice)}
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>App Fee (1%)</span>
          <span>{formatPrice(bookingDetails.appFee)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Tax (11%)</span>
          <span>{formatPrice(bookingDetails.tax)}</span>
        </div>
        <div className="flex justify-between text-base font-medium text-primary pt-2 border-t">
          <span>Total</span>
          <span>{formatPrice(bookingDetails.total)}</span>
        </div>
      </div>
    );
  };

  if (filteredGroups.length === 0) {
    return (
      <>
        {renderEmptySection(
          "No Flight Plans Yet",
          "Start planning your journey by searching for flights and adding them to your plan.",
          <Plane className="h-12 w-12" />
        )}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            className="mx-auto"
            onClick={() => router.push("/flights")}
          >
            <Plane className="h-4 w-4 mr-2" />
            Browse Flight
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add New Flight Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="group hover:border-primary/80"
          onClick={() => router.push("/flights")}
        >
          <Plus className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-gray-600 group-hover:text-primary">
            Add New Flight
          </span>
        </Button>
      </div>

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
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden shrink-0">
                      {getAirlineInfo(
                        plan.flight.flightNumber.split(/(\d+)/)[0]
                      )?.logo ? (
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
                        <Badge
                          variant="outline"
                          className="text-xs bg-primary/5"
                        >
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
                      <div className="mt-2 text-primary font-medium">
                        {formatPrice(plan.flight.price)} per person
                      </div>
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

                <PriceBreakdown plan={plan} />

                <div className="flex justify-end pt-4">
                  <Button
                    className="bg-primary text-white hover:bg-primary/90 px-8"
                    onClick={() => {
                      toast.success("Redirecting to payment...");
                    }}
                  >
                    Pay Now
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
