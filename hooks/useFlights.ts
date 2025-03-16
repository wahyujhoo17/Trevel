import { useEffect, useState } from "react";

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
}

const API_URL =
  "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=SIN&destinationLocationCode=DPS&departureDate=2025-03-20&adults=1";

export function useFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    const fetchFlights = async () => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const parsedFlights = data.data.map((offer: any) => {
          const segment = offer.itineraries[0].segments[0];

          return {
            id: offer.id,
            airline: segment.carrierCode,
            flightNumber: segment.number,
            origin: segment.departure.iataCode,
            destination: segment.arrival.iataCode,
            departureTime: segment.departure.at,
            arrivalTime: segment.arrival.at,
            duration: formatDuration(offer.itineraries[0].duration),
            price: parseFloat(offer.price.total),
            currency: offer.price.currency,
          };
        });

        setFlights(parsedFlights);
      } catch (error) {
        console.error("Error fetching flights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, []);

  return { flights, isLoading, hasSearched };
}

// Fungsi untuk memformat durasi "PT2H45M" menjadi "2h 45m"
const formatDuration = (isoDuration: string): string => {
  return isoDuration
    .replace("PT", "")
    .replace("H", "h ")
    .replace("M", "m")
    .trim();
};
