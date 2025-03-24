"use client";

import { ReactElement, ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plane,
  Calendar,
  Map,
  Trash2,
  Plus,
  Loader2,
  Clock,
  Users,
  ChevronRight,
  Tag,
  Building,
  CreditCard,
  Check,
} from "lucide-react";
import Image from "next/image";
import { getAirlineInfo } from "@/utils/airlines";
import { formatLocation, formatDate } from "@/utils/format";
import { PlanItem, CityGroup } from "@/types/shared";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PaymentModal from "@/components/payment/payment-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  onRemovePlan: (id: string) => Promise<void>;
  renderEmptySection: (
    title: string,
    description: string,
    icon: ReactNode
  ) => ReactElement;
}

// Add helper function to convert price to number
const getPriceAsNumber = (price: string | number): number => {
  if (typeof price === "string") {
    return parseFloat(price.replace(/[^0-9.-]+/g, ""));
  }
  return price;
};

// Update formatPrice function
const formatPrice = (price: string | number): string => {
  const numericPrice = getPriceAsNumber(price);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

export function FlightPlans({
  cityGroups,
  selectedCity,
  onRemovePlan,
  renderEmptySection,
}: FlightPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);
  const [mounted, setMounted] = useState(true); // For animation purposes
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<PlanItem | null>(null);
  const [flightToDelete, setFlightToDelete] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [flightDetailsToDelete, setFlightDetailsToDelete] = useState({
    airline: "",
    flightNumber: "",
  });
  const router = useRouter();

  const toggleExpandFlight = (id: string) => {
    setExpandedFlight(expandedFlight === id ? null : id);
  };

  const filteredGroups = selectedCity
    ? cityGroups.filter((group) => group.code === selectedCity)
    : cityGroups;

  const calculateBookingDetails = (
    price: string | number,
    quantity: number
  ): BookingDetails => {
    // Convert price to number if it's a string
    const numericPrice = getPriceAsNumber(price);

    const basePrice = numericPrice * quantity;
    const appFee = basePrice * 0.01; // 1% app fee
    const tax = basePrice * 0.11; // 11% tax
    const total = basePrice + appFee + tax;

    return {
      basePrice,
      appFee,
      tax,
      total,
    };
  };

  const getQuantity = (plan: PlanItem): number => {
    return plan.quantity ?? 1; // Use nullish coalescing operator
  };

  const PriceBreakdown = ({ plan }: { plan: PlanItem }) => {
    if (!plan.flight) {
      return null;
    }

    // Convert price to number if it's a string
    const price =
      typeof plan.flight.price === "string"
        ? parseFloat(plan.flight.price.replace(/[^0-9.-]+/g, ""))
        : plan.flight.price;

    // Use optional chaining and provide default value
    const quantity = plan.quantity ?? 1;

    const bookingDetails = calculateBookingDetails(price, quantity);

    return (
      <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <CreditCard className="h-4 w-4 mr-2 text-primary" />
          Price Breakdown
        </h4>
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
        <div className="flex justify-between text-base font-medium text-primary pt-3 mt-1 border-t border-slate-200">
          <span>Total</span>
          <span>{formatPrice(bookingDetails.total)}</span>
        </div>
      </div>
    );
  };

  const handlePayment = async (planId: string) => {
    const flight = allFlights.find((plan) => plan.id === planId);
    if (!flight) return;

    setSelectedFlight(flight);
    setShowPaymentModal(true);
  };

  const handleDeleteClick = (
    planId: string,
    airline: string,
    flightNumber: string
  ) => {
    setFlightToDelete(planId);
    setFlightDetailsToDelete({ airline, flightNumber });
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (flightToDelete) {
      try {
        await onRemovePlan(flightToDelete);
        toast.success("Flight removed successfully", {
          description: `${flightDetailsToDelete.airline} ${flightDetailsToDelete.flightNumber} has been removed from your plans.`,
        });
      } catch (error) {
        toast.error("Failed to remove flight", {
          description: "Please try again later.",
        });
      }
      setIsDeleteAlertOpen(false);
      setFlightToDelete(null);
    }
  };

  const allFlights = filteredGroups.reduce((acc, group) => {
    return acc.concat(group.flights || []);
  }, [] as PlanItem[]);

  if (allFlights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Flight Plans
          </h2>
          <Button
            variant="outline"
            className="group hover:border-primary/80"
            onClick={() => router.push("/flights")}
          >
            <Plus className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-gray-600 group-hover:text-primary">
              Add Flight
            </span>
          </Button>
        </div>

        <div className="text-center py-16">
          {renderEmptySection(
            "No Flight Plans Yet",
            "Start planning your journey by searching for flights and adding them to your plan.",
            <Plane className="h-16 w-16" />
          )}
          <div className="mt-6">
            <Button
              className="mx-auto bg-primary/90 hover:bg-primary"
              onClick={() => router.push("/flights")}
            >
              <Plane className="h-4 w-4 mr-2" />
              Browse Flights
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const filteredCities = filteredGroups.filter(
    (city) => city.flights.length > 0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with title and add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Your Flight Plans
        </h2>
        <Button
          variant="outline"
          className="group hover:border-primary/80"
          onClick={() => router.push("/flights")}
        >
          <Plus className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-gray-600 group-hover:text-primary">
            Add Flight
          </span>
        </Button>
      </div>

      <div className="grid gap-6">
        {filteredCities.map((group) => (
          <motion.div
            key={group.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {group.city}
              </h3>
              <Badge
                variant="outline"
                className="ml-2 bg-gray-50 text-gray-600"
              >
                {group.flights?.length || 0} flights
              </Badge>
            </div>

            <div className="grid gap-5">
              {group.flights?.map((plan) => {
                // Early return if no flight data
                if (!plan.flight) {
                  return null;
                }

                const airlineCode = plan.flight.flightNumber.split(/(\d+)/)[0];
                const airlineInfo = getAirlineInfo(airlineCode);

                return (
                  <motion.div key={plan.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-all border-gray-200">
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            {/* Airline Logo */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/5 flex-shrink-0 flex items-center justify-center relative overflow-hidden border border-gray-100">
                              {airlineInfo?.logo ? (
                                <Image
                                  src={airlineInfo.logo}
                                  alt={plan.flight.airline}
                                  fill
                                  className="object-contain p-1"
                                  sizes="56px"
                                  priority
                                />
                              ) : (
                                <Plane className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            {/* Flight Info */}
                            <div className="flex-1 min-w-0">
                              <div className="space-y-1">
                                <h3 className="font-medium text-gray-900 text-base sm:text-lg truncate">
                                  {plan.flight.airline}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {plan.flight.flightNumber}
                                </p>
                              </div>

                              {/* Badges - Wrap on mobile */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs whitespace-nowrap"
                                >
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
                                  <Users className="h-3 w-3 mr-1" />
                                  {plan.quantity}{" "}
                                  {plan.quantity === 1 ? "ticket" : "tickets"}
                                </Badge>
                              </div>
                            </div>

                            {/* Price - Move to top right on mobile */}
                            <div className="w-full sm:w-auto flex justify-between sm:flex-col items-end gap-2">
                              <span className="text-sm text-gray-600">
                                Price per ticket
                              </span>
                              <div className="text-lg font-semibold text-primary">
                                {formatPrice(plan.flight.price)}
                              </div>
                            </div>
                          </div>

                          {/* Flight Route - Improved Mobile View */}
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 w-full">
                            <div className="flex items-center justify-center flex-wrap gap-2">
                              <span className="font-medium text-gray-800 text-sm text-center">
                                {formatLocation(plan.flight.origin)}
                              </span>
                              <div className="flex items-center mx-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                <div className="w-8 h-[1px] bg-gray-300"></div>
                                <Plane className="h-3 w-3 text-primary mx-1 transform rotate-90" />
                                <div className="w-8 h-[1px] bg-gray-300"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                              </div>
                              <span className="font-medium text-gray-800 text-sm text-center">
                                {formatLocation(plan.flight.destination)}
                              </span>
                            </div>
                            <div className="flex items-center justify-center text-gray-700 mt-2">
                              <Clock className="h-3 w-3 mr-1" />
                              <span className="font-medium text-sm">
                                {plan.flight.departureTime} -{" "}
                                {plan.flight.arrivalTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expandable section */}
                        <AnimatePresence>
                          {expandedFlight === plan.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 pt-4 border-t overflow-hidden"
                            >
                              <PriceBreakdown plan={plan} />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Action Buttons - Improved Mobile Layout */}
                        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between gap-3">
                          <div className="flex items-center justify-center sm:justify-start">
                            <Tag className="h-4 w-4 mr-1.5 text-green-600" />
                            <span className="text-sm font-medium text-gray-800">
                              Total:{" "}
                              {formatPrice(
                                calculateBookingDetails(
                                  plan.flight.price,
                                  getQuantity(plan)
                                ).total
                              )}
                            </span>
                          </div>

                          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandFlight(plan.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {expandedFlight === plan.id
                                ? "Hide details"
                                : "Price details"}
                              <ChevronRight
                                className={`h-4 w-4 ml-1 transition-transform ${
                                  expandedFlight === plan.id ? "rotate-90" : ""
                                }`}
                              />
                            </Button>

                            {/* Use a container div for the primary actions */}
                            <div className="flex gap-2 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteClick(
                                    plan.id,
                                    plan.flight?.airline || "Flight",
                                    plan.flight?.flightNumber || "Unknown"
                                  )
                                }
                                className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>

                              <Button
                                className="flex-1 sm:flex-none bg-primary text-white hover:bg-primary/90"
                                size="sm"
                                onClick={() => handlePayment(plan.id)}
                                disabled={isProcessing === plan.id}
                              >
                                {isProcessing === plan.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Pay Now
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
      {selectedFlight && selectedFlight.flight && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedFlight(null);
            setIsProcessing(null);
          }}
          amount={
            calculateBookingDetails(
              selectedFlight.flight.price,
              getQuantity(selectedFlight)
            ).total
          }
          itemType="flight"
          itemDetails={{
            name: selectedFlight.flight.airline,
            checkIn: selectedFlight.flight.departureDate,
            destination: formatLocation(selectedFlight.flight.destination),
            image: getAirlineInfo(
              selectedFlight.flight.flightNumber.split(/(\d+)/)[0]
            )?.logo,
            departureTime: selectedFlight.flight.departureTime,
            arrivalTime: selectedFlight.flight.arrivalTime,
            airline: selectedFlight.flight.airline,
          }}
        />
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-5 w-5" />
              </div>
              <AlertDialogTitle className="text-lg">
                Remove Flight
              </AlertDialogTitle>
            </div>

            <AlertDialogDescription className="pt-3 space-y-3">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                  {getAirlineInfo(
                    flightDetailsToDelete.flightNumber.split(/(\d+)/)[0]
                  )?.logo ? (
                    <Image
                      src={
                        getAirlineInfo(
                          flightDetailsToDelete.flightNumber.split(/(\d+)/)[0]
                        )?.logo || ""
                      }
                      alt={flightDetailsToDelete.airline}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  ) : (
                    <Plane className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {flightDetailsToDelete.airline}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {flightDetailsToDelete.flightNumber}
                  </p>
                </div>
              </div>

              <p>
                Are you sure you want to remove this flight from your plans?
              </p>

              <div className="bg-amber-50 border border-amber-100 rounded-md p-2.5 text-amber-800 flex items-start gap-2">
                <div className="mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <p className="text-sm">
                  This action cannot be undone and your booking information will
                  be permanently removed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 border-gray-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Yes, Remove Flight
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
