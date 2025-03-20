import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plane, Luggage } from "lucide-react";
import Image from "next/image";
import { getAirlineInfo } from "@/utils/airlines";
import { locations } from "@/data/locations"; // Add this import
import { Flight } from "@/types/flight"; // Create this type file if not exists

interface FlightDetailModalProps {
  flight: Flight;
  isOpen: boolean;
  onClose: () => void;
  displayPrice: (price: number | string, currency: string) => string;
  formatLocation: (code: string, fullName?: boolean) => string;
  onAddToPlan: (flightId: string, quantity: number) => void;
}

export function FlightDetailModal({
  flight,
  isOpen,
  onClose,
  displayPrice,
  formatLocation,
  onAddToPlan,
}: FlightDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const maxTickets = Math.min(flight.numberOfBookableSeats, 9);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg md:max-w-2xl w-[95%] p-4 md:p-6">
        {/* Header Section */}
        <DialogHeader className="space-y-2 pb-4 border-b">
          <DialogTitle className="text-xl md:text-2xl font-bold">
            Flight Details
          </DialogTitle>
          <p className="text-sm md:text-base text-muted-foreground">
            {`${formatLocation(flight.origin, true)} → ${formatLocation(
              flight.destination,
              true
            )}`}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Airline and Price Section */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden">
                {getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])?.logo ? (
                  <Image
                    src={
                      getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])!
                        .logo!
                    }
                    alt={flight.airline}
                    fill
                    className="object-contain rounded-full outline outline-2 outline-gray-800 shadow-sm"
                    sizes="(max-width: 768px) 56px, 64px"
                    priority
                  />
                ) : (
                  <Plane className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold">
                  {flight.airline}
                </h3>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                  {getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])
                    ?.alliance && (
                    <Badge variant="outline" className="text-xs bg-primary/5">
                      {
                        getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])
                          ?.alliance
                      }
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Flight Info Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">Date</p>
              <Badge
                variant="outline"
                className="text-xs md:text-sm bg-blue-50"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                {flight.departureDate}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">Cabin</p>
              <Badge
                variant="outline"
                className="text-xs md:text-sm bg-purple-50"
              >
                {flight.cabin}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">Available Seats</p>
              <Badge
                variant="outline"
                className="text-xs md:text-sm bg-green-50"
              >
                {flight.numberOfBookableSeats} seats
              </Badge>
            </div>
            {flight.baggage && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-500">Baggage</p>
                <Badge
                  variant="outline"
                  className="text-xs md:text-sm bg-yellow-50"
                >
                  <Luggage className="h-3.5 w-3.5 mr-1.5" />
                  {flight.baggage}
                </Badge>
              </div>
            )}
          </div>

          {/* Flight Timeline */}
          <div className="relative flex items-center justify-between bg-gray-50/50 rounded-lg p-4 mt-6">
            <div>
              <p className="text-lg font-medium">{flight.departureTime}</p>
              <p className="text-sm text-gray-600 max-w-[140px] md:max-w-none">
                {formatLocation(flight.origin, true)}
              </p>
              {flight.terminal && (
                <p className="text-xs text-gray-500">
                  Terminal {flight.terminal}
                </p>
              )}
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="relative w-32 h-[2px] bg-gray-300">
                <Plane className="absolute -top-[6px] left-1/2 -translate-x-1/2 h-3.5 w-3.5 text-primary rotate-90" />
              </div>
              <p className="text-xs text-gray-500 mt-4">{flight.duration}</p>
              {flight.aircraftType && (
                <p className="text-[10px] text-gray-400">
                  {flight.aircraftType}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-lg font-medium">{flight.arrivalTime}</p>
              <p className="text-sm text-gray-600 max-w-[140px] md:max-w-none">
                {formatLocation(flight.destination, true)}
              </p>
              {flight.terminal && (
                <p className="text-xs text-gray-500">
                  Terminal {flight.terminal}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <DialogFooter className="flex flex-col space-y-6 border-t pt-4 mt-4">
          <div className="flex items-center justify-between w-full">
            {/* Ticket Selection */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Select Tickets</p>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-md p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    setQuantity(Math.min(maxTickets, quantity + 1))
                  }
                  disabled={quantity >= maxTickets}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Price & Add Button */}
            <div className="flex flex-col items-end space-y-2">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-xl font-bold text-primary">
                  {displayPrice(
                    Number(flight.price) * quantity,
                    flight.currency
                  )}
                </p>
              </div>

              {/* Add to Plan Button */}
              <Button
                className="w-full md:w-auto md:px-8"
                onClick={() => {
                  onAddToPlan(flight.id, quantity);
                  onClose();
                }}
              >
                Add to My Plan
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
