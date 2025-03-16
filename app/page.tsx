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
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { PlaceSearch } from "@/components/place-search";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/navbar";
import { FlightResults } from "@/components/flight-results";
import { format } from "date-fns"; // Add this import at the top
import { getAirlineName, getAirlineInfo } from "@/utils/airlines";

const popularDestinations = [
  {
    id: 1,
    name: "Bali, Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800",
    description: "Experience paradise with pristine beaches and rich culture",
  },
  {
    id: 2,
    name: "Bangkok, Thailand",
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=800",
    description: "Vibrant city life meets ancient temples",
  },
  {
    id: 3,
    name: "Ha Long Bay, Vietnam",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800",
    description: "Stunning limestone islands in emerald waters",
  },
  {
    id: 4,
    name: "Lombok, Indonesia",
    image:
      "https://images.unsplash.com/photo-1571366343168-631c5bcca7a4?auto=format&fit=crop&q=80&w=800",
    description: "Pristine beaches, majestic waterfalls, and Mount Rinjani",
  },
  {
    id: 5,
    name: "Palawan, Philippines",
    image:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&q=80&w=800",
    description: "Crystal clear lagoons and hidden beaches",
  },
  {
    id: 6,
    name: "Singapore",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800",
    description: "Modern architecture meets lush gardens",
  },
  {
    id: 7,
    name: "Kuala Lumpur, Malaysia",
    image:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800",
    description: "Iconic towers and diverse culinary scene",
  },
  {
    id: 8,
    name: "Chiang Mai, Thailand",
    image:
      "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?auto=format&fit=crop&q=80&w=800",
    description: "Ancient temples and mountain landscapes",
  },
  {
    id: 9,
    name: "Boracay, Philippines",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    description: "White sand beaches and turquoise waters",
  },
];

export default function Home() {
  const [origin, setOrigin] = useState("SIN");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState({ from: undefined, to: undefined });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const [flights, setFlights] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handlePlanningClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Handle navigation or other actions for logged-in users
      console.log("User is logged in, proceed with planning");
    }
  };

  const handleSearch = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!origin || !destination || !date.from) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
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
      console.log("Flight search results:", rawData);

      // Transform the API response into our Flight interface
      const transformedFlights = rawData.data.map((offer: any) => {
        const segment = offer.itineraries[0].segments[0];
        const departureDate = new Date(segment.departure.at);
        const arrivalDate = new Date(segment.arrival.at);

        return {
          id: offer.id,
          airline: getAirlineName(segment.carrierCode), // Update this line
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
      toast({
        title: "Error",
        description: "Failed to search flights. Please try again.",
        variant: "destructive",
      });
      setFlights([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar user={user} />
      {/* Hero Section */}
      <div className="relative h-[100vh] flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&q=80&w=1920"
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
      <section className="max-w-6xl mx-auto -mt-20 relative z-20 px-4">
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
              <DatePickerWithRange date={date} setDate={setDate} />
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
                  <PlanePilot className="mr-2" /> Search
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Add after the search section */}
      <section className="max-w-6xl mx-auto py-8 px-4">
        <FlightResults
          flights={flights}
          isLoading={isSearching}
          hasSearched={hasSearched}
        />
      </section>

      {/* Popular Destinations */}
      <section className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold mb-8">Popular Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularDestinations.map((destination) => (
            <Card
              key={destination.id}
              className="overflow-hidden group cursor-pointer"
            >
              <div className="relative h-64">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">
                  {destination.name}
                </h3>
                <p className="text-gray-600">{destination.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Add Copyright Section */}
      <footer className="bg-gray-50 py-6">
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
