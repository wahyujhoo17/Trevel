"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Plane,
  Luggage,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { getAirlineInfo } from "@/utils/airlines";
import { locations } from "@/data/locations";
import { Flight } from "@/types/flight";
import { ref, push, set, serverTimestamp } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";

interface FlightDetailModalProps {
  flight: Flight | null;
  isOpen: boolean;
  onClose: () => void;
  displayPrice: (price: string | number, originalCurrency: string) => string;
  formatLocation: (code: string, isModal?: boolean) => string;
  onAddToPlan: (flightId: string, quantity: number) => Promise<void>;
  quantity?: number;
}

export function FlightDetailModal({
  flight,
  isOpen,
  onClose,
  displayPrice,
  formatLocation,
  onAddToPlan,
  quantity: initialQuantity = 1,
}: FlightDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    // Reset states when modal is opened
    if (isOpen) {
      setIsAdded(false);
      setQuantity(initialQuantity);
    }
  }, [isOpen, initialQuantity]);

  if (!flight) return null;

  // Get airline info
  const airlineCode = flight.flightNumber?.split(/\d/)[0] || "";
  const airlineInfo = getAirlineInfo(airlineCode);

  // Handle quantity change
  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 9)); // Maximum 9 tickets
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1)); // Minimum 1 ticket
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(parseInt(value));
  };

  const addToMyPlan = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error("Authentication Required", {
          description: "Please log in to add flights to your plan",
        });
        return;
      }

      // Try to get a fresh token
      await user.getIdToken(true);

      setIsSubmitting(true);

      // Simplify data structure if possible
      const flightData = {
        userId: user.uid,
        type: "flight",
        flightId: flight.id || `${flight.flightNumber}-${Date.now()}`,
        quantity, // Use the current quantity state
        flight: {
          airline: flight.airline || "Unknown Airline",
          flightNumber: flight.flightNumber || "Unknown",
          departureDate:
            flight.departureDate || new Date().toISOString().split("T")[0],
          departureTime: flight.departureTime || "00:00",
          arrivalTime: flight.arrivalTime || "00:00",
          origin: flight.origin || "Unknown",
          destination: flight.destination || "Unknown",
          cabin: flight.cabin || "Economy",
          price: flight.price || "$0",
        },
        createdAt: serverTimestamp(),
        status: "confirmed",
      };

      // Write ke plans
      const plansRef = ref(db, `plans/${user.uid}`);
      const newPlanRef = push(plansRef);
      await set(newPlanRef, flightData);

      setIsAdded(true);
      toast.success("Added to your plan!");
    } catch (error: any) {
      let errorMessage = "Failed to add flight to your plan";
      if (
        error.code === "PERMISSION_DENIED" ||
        error.code === "permission_denied"
      ) {
        errorMessage = "Permission denied. Please log out and log back in.";
      }

      toast.error("Error", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {airlineInfo?.logo ? (
              <div className="w-8 h-8 relative">
                <Image
                  src={airlineInfo.logo}
                  alt={flight.airline || ""}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <Plane className="h-6 w-6" />
            )}
            {flight.airline} {flight.flightNumber}
          </DialogTitle>
          <DialogDescription>
            {formatLocation(flight.origin)} to{" "}
            {formatLocation(flight.destination)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Flight Info Card */}
          <div className="border rounded-lg p-4">
            {/* Flight Path */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="text-center lg:text-left">
                <p className="text-sm text-gray-500">From</p>
                <h3 className="text-lg font-semibold">
                  {formatLocation(flight.origin)}
                </h3>
                <p className="text-xl font-bold">{flight.departureTime}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full flex items-center">
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  <div className="h-0.5 flex-1 bg-gray-300"></div>
                  <Plane className="h-5 w-5 text-primary mx-2" />
                  <div className="h-0.5 flex-1 bg-gray-300"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <p className="text-sm text-gray-500">To</p>
                <h3 className="text-lg font-semibold">
                  {formatLocation(flight.destination)}
                </h3>
                <p className="text-xl font-bold">{flight.arrivalTime}</p>
              </div>
            </div>

            {/* Flight Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{flight.departureDate}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium">{flight.cabin}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Flight</p>
                <p className="font-medium">{flight.flightNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{flight.duration || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-base font-medium">Number of Passengers</h3>
              </div>

              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-8 w-8 rounded-full"
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <Select
                  value={quantity.toString()}
                  onValueChange={handleQuantityChange}
                >
                  <SelectTrigger className="w-16 h-8 mx-2 text-center">
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= 9}
                  className="h-8 w-8 rounded-full"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-primary">
                  {typeof flight.price === "number"
                    ? `$${(flight.price * quantity).toFixed(2)}`
                    : typeof flight.price === "string" &&
                      flight.price.startsWith("$")
                    ? `$${(
                        parseFloat(flight.price.substring(1)) * quantity
                      ).toFixed(2)}`
                    : `${flight.price} × ${quantity}`}
                </p>
              </div>
              <div>
                <Badge variant="outline" className="text-xs">
                  {quantity} ×{" "}
                  {typeof flight.price === "number"
                    ? `$${flight.price.toFixed(2)}`
                    : flight.price}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                `https://www.google.com/search?q=${encodeURIComponent(
                  `${flight.airline} ${flight.flightNumber} ${flight.departureDate}`
                )}`,
                "_blank"
              )
            }
          >
            Check Flight Status
          </Button>
          <Button
            onClick={addToMyPlan}
            className={isAdded ? "bg-green-600 hover:bg-green-700" : ""}
            disabled={isSubmitting || isAdded}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Adding...
              </span>
            ) : isAdded ? (
              <span className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Added to My Plan
              </span>
            ) : (
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Add {quantity > 1 ? `${quantity} tickets` : "to My Plan"}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
