import { Card } from "@/components/ui/card";
import { Loader2, Plane, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAirlineInfo } from "@/utils/airlines";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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

export function FlightResults({
  flights,
  isLoading,
  hasSearched,
}: FlightResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 5;
  const [selectedCurrency, setSelectedCurrency] = useState<
    "EUR" | "USD" | "IDR"
  >("EUR");

  // Calculate pagination
  const indexOfLastFlight = currentPage * flightsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
  const currentFlights = flights.slice(indexOfFirstFlight, indexOfLastFlight);
  const totalPages = Math.ceil(flights.length / flightsPerPage);

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="space-y-4">
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
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {flights.length} flights found
          </Badge>
        </div>
      </div>

      {currentFlights.map((flight) => (
        <Card
          key={flight.id}
          className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-white"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden">
                {getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])?.logo ? (
                  <Image
                    src={
                      getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])!
                        .logo!
                    }
                    alt={flight.airline}
                    fill
                    className="object-contain p-1 rounded-full"
                    sizes="48px"
                    priority
                  />
                ) : (
                  <Plane className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {flight.airline}
                </h3>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-primary/80">
                    {flight.flightNumber}
                  </p>
                  {getAirlineInfo(flight.flightNumber.split(/(\d+)/)[0])
                    ?.alliance && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-primary/5 text-primary/80"
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
              <p className="text-2xl font-bold text-primary">
                {displayPrice(flight.price, flight.currency)}
              </p>
              <div className="text-sm text-gray-500">
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

          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="bg-blue-50">
              <Calendar className="h-3 w-3 mr-1" />
              {flight.departureDate}
            </Badge>
            <Badge variant="outline" className="bg-purple-50">
              {flight.cabin}
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              {flight.numberOfBookableSeats} seats left
            </Badge>
            {flight.terminal && (
              <Badge variant="outline" className="bg-orange-50">
                Terminal {flight.terminal}
              </Badge>
            )}
            {flight.baggage && (
              <Badge variant="outline" className="bg-yellow-50">
                {flight.baggage}
              </Badge>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <p className="font-medium text-lg text-gray-800">
                  {flight.departureTime}
                </p>
              </div>
              <div className="ml-6">
                <p className="text-sm font-medium text-gray-800">
                  {formatLocation(flight.origin)}
                </p>
                {flight.terminal && (
                  <p className="text-xs text-gray-500">
                    Terminal {flight.terminal}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center px-8">
              <div className="w-32 h-[2px] bg-gray-200 relative">
                <Plane className="h-4 w-4 text-primary absolute -top-[7px] left-1/2 transform -translate-x-1/2 rotate-90" />
              </div>
              <p className="text-sm font-medium text-gray-600 mt-2">
                {flight.duration}
              </p>
              {flight.aircraftType && (
                <p className="text-xs text-gray-400">{flight.aircraftType}</p>
              )}
            </div>

            <div className="flex-1 text-right">
              <div className="flex items-center justify-end space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <p className="font-medium text-lg text-gray-800">
                  {flight.arrivalTime}
                </p>
              </div>
              <div className="mr-6">
                <p className="text-sm font-medium text-gray-800">
                  {formatLocation(flight.destination)}
                </p>
                {flight.terminal && (
                  <p className="text-xs text-gray-500">
                    Terminal {flight.terminal}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(index + 1)}
              className="w-8"
            >
              {index + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
