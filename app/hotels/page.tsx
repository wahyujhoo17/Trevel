"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { useState, useEffect, useMemo } from "react";
import { PlaceSearch } from "@/components/place-search";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import { HotelResults } from "@/components/hotel-results";
import { GuestInput } from "@/components/guest-input";
import { StarRating } from "@/components/ui/star-rating";
import { useFlightPlans } from "@/hooks/useFlightPlans";
import { HotelDetailModal } from "@/components/hotel-detail-modal";
import { Hotel } from "@/types/hotel";
import { DateRange as DayPickerRange } from "react-day-picker";
import { CustomDateRange } from "@/types/date";
import { locations } from "@/data/locations";

// Remove the local DateRange interface since we're importing CustomDateRange

interface GuestDetails {
  adults: number;
  children: number;
  childrenAges: number[];
}

export default function HotelsPage() {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<CustomDateRange>({
    from: undefined,
    to: undefined,
  });
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    adults: 1,
    children: 0,
    childrenAges: [],
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();
  const { flightDate, isLoading } = useFlightPlans();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Update dateRange when date changes
  useEffect(() => {
    if (date.from && date.to) {
      setDateRange({
        from: date.from,
        to: date.to,
      });
    }
  }, [date.from, date.to]);

  const handleDateChange = (newDate: DayPickerRange | undefined) => {
    if (newDate) {
      setDate({
        from: newDate.from || undefined,
        to: newDate.to || undefined,
      });
    } else {
      setDate({
        from: undefined,
        to: undefined,
      });
    }
  };

  const handleSearch = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Define array type for missing fields
    const missingFields: string[] = [];

    if (!destination) missingFields.push("destination");
    if (!date.from) missingFields.push("check-in date");
    if (!date.to) missingFields.push("check-out date");
    if (guestDetails.adults < 1) missingFields.push("number of adults");

    // Validate children ages
    if (
      guestDetails.children > 0 &&
      guestDetails.childrenAges.length !== guestDetails.children
    ) {
      toast.error("Missing children's ages", {
        description: "Please specify age for each child",
      });
      return;
    }

    if (missingFields.length > 0) {
      toast.error("Missing search criteria", {
        description: `Please fill in: ${missingFields.join(", ")}`,
      });
      return;
    }

    // Validate date range
    if (date.from && date.to && date.from >= date.to) {
      toast.error("Invalid date range", {
        description: "Check-out date must be after check-in date",
      });
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);

      // Find the location object that matches the destination
      const locationInfo = locations.find(
        (loc) =>
          loc.code === destination ||
          loc.city.toLowerCase() === destination.toLowerCase()
      );

      if (!locationInfo) {
        toast.error("Invalid destination", {
          description: "Please select a valid destination from the list",
        });
        setIsSearching(false);
        return;
      }

      // Use both city name and code for better search results
      const params = new URLSearchParams({
        destination: locationInfo.city,
        destinationCode: locationInfo.code,
        checkIn: format(date.from!, "yyyy-MM-dd"),
        checkOut: format(date.to!, "yyyy-MM-dd"),
        adults: guestDetails.adults.toString(),
      });

      if (guestDetails.children > 0) {
        params.append("children", guestDetails.children.toString());
        params.append("children_ages", guestDetails.childrenAges.join(","));
      }

      const response = await fetch(`/api/hotels?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (Array.isArray(data.hotels)) {
          setHotels(data.hotels);
        } else {
          console.error("Invalid hotels data structure:", data);
          setHotels([]);
        }
      } else {
        throw new Error(data.error || "Failed to fetch hotels");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search properties", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
      setHotels([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Calculate selected dates once
  const selectedDates = useMemo(() => {
    if (date.from && date.to) {
      return {
        from: date.from,
        to: date.to,
      };
    }
    return undefined;
  }, [date.from, date.to]);

  // Handle hotel selection
  const handleHotelSelect = (hotel: Hotel) => {
    if (!date.from || !date.to) {
      toast.error("Please select dates", {
        description: "You need to select check-in and check-out dates first",
      });
      return;
    }
    setSelectedHotel(hotel);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative min-h-[400px] bg-gradient-to-b from-gray-900/50 to-gray-50">
        <div className="absolute inset-0">
          <Image
            src="/images/hotel-placeholder.jpg"
            alt="Luxury Hotel View"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        </div>

        {/* Navigation */}
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
              Find Perfect Hotels
            </h1>
            <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
              Discover and book the best hotels for your stay
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <Card className="p-6 shadow-xl bg-white/90 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Destination */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                Destination
              </label>
              <PlaceSearch
                value={destination}
                onChange={setDestination}
                placeholder="Where are you going?"
              />
            </div>

            {/* Dates and Guests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Check-in - Check-out
                </label>
                <DatePickerWithRange date={date} setDate={handleDateChange} />
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Guests
                </label>
                <GuestInput value={guestDetails} onChange={setGuestDetails} />
              </div>
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
                    <Building2 className="mr-2 h-5 w-5" />
                    Search Hotels
                  </div>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        {hasSearched && !isSearching && hotels.length > 0 && (
          <div className="mt-8 mb-4">
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">{destination}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(date.from!, "MMM d")} -{" "}
                      {format(date.to!, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>
                      {guestDetails.adults}{" "}
                      {guestDetails.adults === 1 ? "adult" : "adults"}
                      {guestDetails.children > 0 &&
                        `, ${guestDetails.children} ${
                          guestDetails.children === 1 ? "child" : "children"
                        }`}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Hotel Results */}
        <div className="my-8">
          <HotelResults
            hotels={hotels}
            isLoading={isSearching}
            hasSearched={hasSearched}
            selectedDates={selectedDates}
            onHotelSelect={handleHotelSelect}
          />
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <HotelDetailModal
        hotel={selectedHotel}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDates={selectedDates}
        destination={destination}
      />
    </div>
  );
}
