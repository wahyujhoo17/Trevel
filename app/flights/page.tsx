"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Plane,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { useState } from "react";
import { PlaceSearch } from "@/components/place-search";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/hooks/useAuth";
import { FlightResults } from "@/components/flight-results";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAirlineName } from "@/utils/airlines";
import Image from "next/image";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export default function FlightsPage() {
  const [origin, setOrigin] = useState("SIN");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [flights, setFlights] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!origin || !destination || !date.from) {
      toast.error("Missing search criteria", {
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/flights?` +
          new URLSearchParams({
            origin,
            destination,
            departureDate: format(date.from, "yyyy-MM-dd"),
            ...(date.to && { returnDate: format(date.to, "yyyy-MM-dd") }),
          })
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      const transformedFlights = rawData.data.map((offer: any) => {
        const segment = offer.itineraries[0].segments[0];
        const departureDate = new Date(segment.departure.at);
        const arrivalDate = new Date(segment.arrival.at);

        return {
          id: offer.id,
          airline: getAirlineName(segment.carrierCode) || segment.carrierCode,
          flightNumber: `${segment.carrierCode}${segment.number}`,
          origin: segment.departure.iataCode,
          destination: segment.arrival.iataCode,
          departureTime: format(departureDate, "HH:mm"),
          arrivalTime: format(arrivalDate, "HH:mm"),
          departureDate: format(departureDate, "EEE, MMM d"),
          duration: segment.duration
            .replace("PT", "")
            .replace("H", "h ")
            .replace("M", "m"),
          price: parseFloat(offer.price.total),
          currency: offer.price.currency,
          cabin: offer.travelerPricings[0].fareDetailsBySegment[0].cabin,
          numberOfBookableSeats: offer.numberOfBookableSeats,
          baggage: `${
            offer.travelerPricings[0].fareDetailsBySegment[0]
              .includedCheckedBags?.weight || 0
          }${
            offer.travelerPricings[0].fareDetailsBySegment[0]
              .includedCheckedBags?.weightUnit || "KG"
          }`,
          terminal: segment.departure.terminal,
          aircraftType: segment.aircraft?.code,
        };
      });

      setFlights(transformedFlights);
    } catch (error) {
      console.error("Error searching flights:", error);
      toast.error("Failed to search flights", {
        description: "Please try again later",
      });
      setFlights([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-height Hero Section with Navigation */}
      <div className="relative min-h-[400px] bg-gradient-to-b from-gray-900/50 to-gray-50">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/flight-hero.jpg"
            alt="Airplane wing above clouds"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        </div>

        {/* Navigation - Now overlaid on the image */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/my-plan"
              className="inline-flex items-center text-sm text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Plan
            </Link>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl tracking-tight">
              Find Your Flight
            </h1>
            <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
              Search and compare flights to find the best deals
            </p>
          </div>
        </div>
      </div>

      {/* Search Form - Positioned over the hero gradient */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <Card className="p-6 shadow-xl bg-white/90 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  {/* <MapPin className="h-4 w-4 mr-2 text-primary" /> */}
                  From
                </label>
                <PlaceSearch
                  value={origin}
                  onChange={setOrigin}
                  placeholder="Departure city"
                  defaultLocation="SIN"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  {/* <MapPin className="h-4 w-4 mr-2 text-primary" /> */}
                  To
                </label>
                <PlaceSearch
                  value={destination}
                  onChange={setDestination}
                  placeholder="Destination city"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                {/* <Calendar className="h-4 w-4 mr-2 text-primary" /> */}
                Travel Dates
              </label>
              <DatePickerWithRange date={date} setDate={setDate} />
            </div>

            {/* Search Button */}
            <div className="flex justify-end pt-4">
              <Button
                size="lg"
                className="min-w-[200px] bg-primary hover:bg-primary/90"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Plane className="mr-2 h-5 w-5" />
                    Search
                  </div>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Search Results Summary */}
        {hasSearched && !isSearching && flights.length > 0 && (
          <div className="mt-8 mb-4">
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">{origin}</span>
                    <ArrowLeft className="h-4 w-4 mx-2 rotate-180" />
                    <span className="font-medium">{destination}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(date.from!, "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Flight Results */}
        <div className="my-8">
          <FlightResults
            flights={flights}
            isLoading={isSearching}
            hasSearched={hasSearched}
          />
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
