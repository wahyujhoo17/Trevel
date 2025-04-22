"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/date-range-picker";
import {
  Plane as PlanePilot,
  MapPin,
  Calendar,
  Activity,
  Loader2,
  Star,
  DollarSign,
  Hotel, // Added Hotel icon
  ExternalLink, // Added ExternalLink icon
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { PlaceSearch } from "@/components/place-search";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { FlightResults } from "@/components/flight-results";
import { format } from "date-fns";
import { getAirlineName, getAirlineInfo } from "@/utils/airlines";
import { link } from "node:fs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Plane } from "lucide-react"; // Keep Plane icon
import { locations } from "@/data/locations";
import destinationJson from "@/data/destination.json"; // Import the JSON data directly
import { Destination } from "@/types/destination";
import { DateRange } from "react-day-picker";
import { CustomDateRange, DateRangeProps } from "@/types/date";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Access the data array from the imported JSON
const destinationData: Destination[] = destinationJson.data;

export default function Home() {
  const [origin, setOrigin] = useState("SIN");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<CustomDateRange>({
    from: undefined,
    to: undefined,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const [flights, setFlights] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Handle redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User successfully logged in after redirect
          toast.success("Successfully logged in!");
        }
      })
      .catch((error) => {
        console.error("Redirect error:", error);
        toast.error("Login failed. Please try again.");
      });
  }, []);

  const handlePlanningClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      router.push("/my-plan");
    }
  };

  const handleSearch = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!origin) {
      toast.error("Missing departure city", {
        description: "Please select where you're flying from",
      });
      return;
    }

    if (!destination) {
      toast.error("Missing destination", {
        description: "Please select where you're flying to",
      });
      return;
    }

    if (!date.from) {
      toast.error("Missing travel dates", {
        description: "Please select when you want to travel",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      console.log("Search parameters:", {
        origin,
        destination,
        departureDate: format(date.from, "yyyy-MM-dd"),
        returnDate: date.to ? format(date.to, "yyyy-MM-dd") : undefined,
      });

      const params: Record<string, string> = {
        origin,
        destination,
        departureDate: format(date.from!, "yyyy-MM-dd"),
      };

      if (date.to) {
        params.returnDate = format(date.to, "yyyy-MM-dd");
      }

      const response = await fetch(
        `/api/flights?${new URLSearchParams(params)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log("Flight search results:", rawData);

      const transformedFlights = rawData.data.map((offer: any) => {
        const segment = offer.itineraries[0].segments[0];
        const departureDate = new Date(segment.departure.at);
        const arrivalDate = new Date(segment.arrival.at);

        return {
          id: offer.id,
          airline: getAirlineName(segment.carrierCode),
          flightNumber: `${segment.carrierCode}${segment.number}`,
          origin: segment.departure.iataCode,
          destination: segment.arrival.iataCode,
          departureTime: departureDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          arrivalTime: arrivalDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          departureDate: departureDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
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
          } baggage`,
          terminal: segment.departure.terminal || undefined,
          aircraftType: segment.aircraft?.code,
        };
      });

      setFlights(transformedFlights);
    } catch (error) {
      console.error("Error searching flights:", error);
      toast.error("Failed to search flights", {
        description: "Please try again.",
      });
      setFlights([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
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

  const renderDestinations = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {destinationData.map((destination) => (
          <Card
            key={destination.id}
            className="group overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {destination.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{destination.location}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {destination.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-primary">
                    <Plane className="w-4 h-4 mr-1" />
                    <span>Flight</span>
                  </div>
                  <Badge variant="secondary" className="font-medium">
                    {destination.prices.flight.amount}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-primary">
                    <Hotel className="w-4 h-4 mr-1" />
                    <span>Hotel</span>
                  </div>
                  <Badge variant="secondary" className="font-medium">
                    {destination.prices.hotel.amount}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <Button
                  className="flex-1 bg-primary text-white hover:bg-primary/90"
                  onClick={() => {
                    const locationData = locations.find(
                      (loc) =>
                        loc.city
                          .toLowerCase()
                          .includes(destination.name.toLowerCase()) ||
                        loc.name
                          .toLowerCase()
                          .includes(destination.name.toLowerCase()) ||
                        (destination.name ===
                          "Federal Territory of Kuala Lumpur" &&
                          loc.city === "Kuala Lumpur") ||
                        (destination.name === "Hội An" && loc.code === "DAD") ||
                        (destination.name === "Hạ Long Bay" &&
                          loc.code === "HPH")
                    );

                    if (locationData) {
                      setDestination(locationData.code);
                      document
                        .getElementById("search-section")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    } else {
                      toast.error(
                        `Airport code not found for ${destination.name}. Please select manually.`
                      );
                      console.warn(
                        "No matching location found for:",
                        destination.name
                      );
                      document
                        .getElementById("search-section")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }
                  }}
                >
                  Select
                </Button>
                <Button
                  variant="outline"
                  className="px-3"
                  onClick={() => window.open(destination.link, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen">
      <Navbar user={user} />
      {/* Hero Section */}
      <div className="relative h-[100vh] flex items-center justify-center">
        <Image
          src="/images/bg.jpg"
          alt="Southeast Asia Travel"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Discover Southeast Asia
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Plan your perfect adventure with AI-powered itineraries and local
            insights
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={handlePlanningClick}
          >
            Start Planning Your Trip
          </Button>
        </div>
      </div>
      {/* Search Section */}
      <section
        id="search-section"
        className="max-w-6xl mx-auto -mt-20 relative z-20 px-4"
      >
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <PlaceSearch
                value={origin}
                onChange={setOrigin}
                placeholder="From where?"
                defaultLocation="SIN"
              />
            </div>
            <div>
              <PlaceSearch
                value={destination}
                onChange={setDestination}
                placeholder="Where to?"
              />
            </div>
            <div className="md:col-span-1">
              <DatePickerWithRange date={date} setDate={handleDateChange} />
            </div>
            <Button
              className="h-full bg-primary hover:bg-primary/90"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : (
                <>
                  <PlanePilot className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Flight Results Section */}
      <section className="max-w-6xl mx-auto py-8 px-4">
        <FlightResults
          flights={flights}
          isLoading={isSearching}
          hasSearched={hasSearched}
        />
      </section>

      {/* Popular Destinations */}
      <section className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left">
          Popular Destinations
        </h2>
        {renderDestinations()}
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-50 py-6 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} TripPlaner by BagusWS. All rights
          reserved.
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </main>
  );
}
