import { Card } from "@/components/ui/card";
import { Loader2, Plane, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAirlineInfo, getAirlineName } from "@/utils/airlines";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { locations } from "@/data/locations";
import { convertCurrency, formatCurrency } from "@/utils/currency";

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number | string;
  currency: string;
  departureDate: string;
  cabin: string;
  numberOfBookableSeats: number;
  baggage: string;
  terminal?: string;
  aircraftType?: string;
}

interface FlightResultsProps {
  flights: Flight[];
  isLoading: boolean;
  hasSearched?: boolean;
}

const formatMobileLocation = (code: string) => {
  const location = locations.find((loc) => loc.code === code);
  if (!location) return code;

  // Truncate name if longer than 15 characters
  const truncatedName =
    location.name.length > 15
      ? location.name.slice(0, 15) + ".."
      : location.name;

  return `${truncatedName} (${code})`;
};

const MobileFlightCard = ({ flight, displayPrice, formatLocation }) => (
  <div className="block md:hidden">
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden">
          {getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])?.logo ? (
            <Image
              src={getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])!.logo!}
              alt={flight.airline}
              fill
              className="object-contain rounded-full outline outline-2 outline-gray-800 shadow-sm"
              sizes="32px"
              priority
            />
          ) : (
            <Plane className="h-4 w-4 text-primary" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{flight.airline}</p>
          <p className="text-xs text-primary/80">{flight.flightNumber}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-base font-bold text-primary">
          {displayPrice(flight.price, flight.currency)}
        </p>
        <p className="text-[10px] text-gray-500">per person</p>
      </div>
    </div>

    <div className="mt-2 flex flex-wrap gap-1">
      <Badge variant="outline" className="text-[10px] bg-blue-50">
        <Calendar className="h-2.5 w-2.5 mr-1" />
        {flight.departureDate}
      </Badge>
      <Badge variant="outline" className="text-[10px] bg-purple-50">
        {flight.cabin}
      </Badge>
      <Badge variant="outline" className="text-[10px] bg-green-50">
        {flight.numberOfBookableSeats} seats
      </Badge>
    </div>

    <div className="mt-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{flight.departureTime}</p>
        <p className="text-[10px] text-gray-600">
          {formatMobileLocation(flight.origin)}
        </p>
      </div>
      <div className="flex flex-col items-center px-1">
        <div className="w-16 h-px bg-gray-200 relative">
          <Plane className="h-3 w-3 text-primary absolute -top-1.5 left-1/2 transform -translate-x-1/2 rotate-90" />
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">{flight.duration}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{flight.arrivalTime}</p>
        <p className="text-[10px] text-gray-600">
          {formatMobileLocation(flight.destination)}
        </p>
      </div>
    </div>
  </div>
);

export function FlightResults({
  flights,
  isLoading,
  hasSearched,
}: FlightResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 5;
  const [selectedCurrency, setSelectedCurrency] = useState<
    "EUR" | "USD" | "IDR"
  >("IDR");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Calculate pagination
  const indexOfLastFlight = currentPage * flightsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
  const currentFlights = flights.slice(indexOfFirstFlight, indexOfLastFlight);
  const totalPages = Math.ceil(flights.length / flightsPerPage);

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to the flight results container
    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const formatPrice = (price: number | string): string => {
    try {
      const numericPrice =
        typeof price === "string" ? parseFloat(price) : price;
      return !isNaN(numericPrice) ? numericPrice.toFixed(2) : "0.00";
    } catch (error) {
      console.error("Error formatting price:", error);
      return "0.00";
    }
  };

  const formatLocation = (code: string) => {
    const location = locations.find((loc) => loc.code === code);
    return location ? `${location.name} (${code})` : code;
  };

  const displayPrice = (price: number | string, originalCurrency: string) => {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return "0.00";

    if (originalCurrency === selectedCurrency) {
      return formatCurrency(numericPrice, selectedCurrency);
    }

    const convertedAmount = convertCurrency(
      numericPrice,
      originalCurrency,
      selectedCurrency
    );
    return formatCurrency(convertedAmount, selectedCurrency);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasSearched && (!flights || flights.length === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No flights found for these criteria</p>
      </div>
    );
  }

  if (!hasSearched) {
    return null;
  }

  return (
    <div ref={resultsRef} className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Available Flights</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Currency:</label>
            <select
              value={selectedCurrency}
              onChange={(e) =>
                setSelectedCurrency(e.target.value as "EUR" | "USD" | "IDR")
              }
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="IDR">IDR</option>
            </select>
          </div>
          <Badge
            variant="secondary"
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 flex items-center justify-center text-center"
          >
            {flights.length} flights
          </Badge>
        </div>
      </div>

      {currentFlights.map((flight) => (
        <Card
          key={flight.id}
          className="p-3 md:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-white"
        >
          <MobileFlightCard
            flight={flight}
            displayPrice={displayPrice}
            formatLocation={formatLocation}
          />

          {/* Desktop layout - hide on mobile */}
          <div className="hidden md:block">
            {/* Keep your existing desktop layout code unchanged */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden">
                  {getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])
                    ?.logo ? (
                    <Image
                      src={
                        getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])!
                          .logo!
                      }
                      alt={flight.airline}
                      fill
                      className="object-contain rounded-full outline outline-2 outline-gray-800 shadow-lg shadow-gray-300"
                      sizes="(max-width: 768px) 40px, 48px"
                      priority
                    />
                  ) : (
                    <Plane className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {flight.airline}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs md:text-sm text-primary/80">
                      {flight.flightNumber}
                    </p>
                    {getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])
                      ?.alliance && (
                      <Badge
                        variant="outline"
                        className="hidden md:inline-flex text-xs bg-primary/5 text-primary/80"
                      >
                        {
                          getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])
                            ?.alliance
                        }
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {displayPrice(flight.price, flight.currency)}
                </p>
                <div className="text-xs md:text-sm text-gray-500">
                  <p>per person</p>
                  {flight.currency !== selectedCurrency && (
                    <p className="text-xs">
                      Original:{" "}
                      {formatCurrency(Number(flight.price), flight.currency)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Flight badges section */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge
                variant="outline"
                className="bg-blue-50 text-xs md:text-sm"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {flight.departureDate}
              </Badge>
              <Badge
                variant="outline"
                className="bg-purple-50 text-xs md:text-sm"
              >
                {flight.cabin}
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-xs md:text-sm"
              >
                {flight.numberOfBookableSeats} seats
              </Badge>
              {flight.terminal && (
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-xs md:text-sm hidden md:inline-flex"
                >
                  Terminal {flight.terminal}
                </Badge>
              )}
              {flight.baggage && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-xs md:text-sm hidden md:inline-flex"
                >
                  {flight.baggage}
                </Badge>
              )}
            </div>

            {/* Flight details section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 gap-4 md:gap-0">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-base md:text-lg text-gray-800">
                    {flight.departureTime}
                  </p>
                </div>
                <div className="ml-6">
                  <p className="text-xs md:text-sm font-medium text-gray-800">
                    {formatLocation(flight.origin)}
                  </p>
                  {flight.terminal && (
                    <p className="text-xs text-gray-500 hidden md:block">
                      Terminal {flight.terminal}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center px-2 md:px-8 w-full md:w-auto">
                <div className="w-24 md:w-32 h-[2px] bg-gray-200 relative">
                  <Plane className="h-3 w-3 md:h-4 md:w-4 text-primary absolute -top-[6px] md:-top-[7px] left-1/2 transform -translate-x-1/2 rotate-90" />
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 ml-2 md:ml-0 md:mt-2">
                  {flight.duration}
                </p>
                {flight.aircraftType && (
                  <p className="text-xs text-gray-400 hidden md:block">
                    {flight.aircraftType}
                  </p>
                )}
              </div>

              <div className="flex-1 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-base md:text-lg text-gray-800">
                    {flight.arrivalTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-800">
                    {formatLocation(flight.destination)}
                  </p>
                  {flight.terminal && (
                    <p className="text-xs text-gray-500 hidden md:block">
                      Terminal {flight.terminal}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Update pagination for mobile */}
      {totalPages > 1 && (
        <>
          {/* Mobile pagination */}
          <div className="flex md:hidden justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop pagination - keep unchanged */}
          <div className="hidden md:flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 md:p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index + 1}
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(index + 1)}
                className="w-6 md:w-8 text-xs md:text-sm"
              >
                {index + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 md:p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
