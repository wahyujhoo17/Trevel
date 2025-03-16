import { locations } from "./locations";
import { getAmadeusToken } from "@/lib/amadeus";

export interface Flight {
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

// Helper function to generate flight number
const generateFlightNumber = (airline: string, num: number): string => {
  const prefix = airline
    .split(" ")
    .map((word) => word[0])
    .join("");
  return `${prefix}${num.toString().padStart(3, "0")}`;
};

// Generate mock flights between locations
export const generateFlights = (
  origin: string,
  destination: string
): Flight[] => {
  const originLocation = locations.find((loc) => loc.code === origin);
  const destLocation = locations.find((loc) => loc.code === destination);

  if (!originLocation || !destLocation) return [];

  const airlines = {
    SIN: "Singapore Airlines",
    BKK: "Thai Airways",
    DPS: "Garuda Indonesia",
    KUL: "Malaysia Airlines",
    MNL: "Philippine Airlines",
    SGN: "Vietnam Airlines",
    HAN: "Vietnam Airlines",
    PNH: "Cambodia Angkor Air",
    RGN: "Myanmar Airways",
    VTE: "Lao Airlines",
    SUB: "Garuda Indonesia",
    UPG: "Garuda Indonesia",
    DVO: "Philippine Airlines",
    MDC: "Garuda Indonesia",
    DMK: "Thai AirAsia",
  };

  const basePrice = Math.floor(Math.random() * (500 - 200) + 200);

  return [
    {
      id: `${origin}-${destination}-1`,
      airline: airlines[origin] || "Regional Airways",
      flightNumber: generateFlightNumber(
        airlines[origin] || "Regional Airways",
        1
      ),
      origin: originLocation.code,
      destination: destLocation.code,
      departureTime: "08:00",
      arrivalTime: "10:30",
      duration: "2h 30m",
      price: basePrice,
      currency: "USD",
    },
    {
      id: `${origin}-${destination}-2`,
      airline: airlines[origin] || "Regional Airways",
      flightNumber: generateFlightNumber(
        airlines[origin] || "Regional Airways",
        2
      ),
      origin: originLocation.code,
      destination: destLocation.code,
      departureTime: "14:30",
      arrivalTime: "17:00",
      duration: "2h 30m",
      price: basePrice + Math.floor(Math.random() * 50),
      currency: "USD",
    },
  ];
};

export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string
): Promise<Flight[]> {
  try {
    const { access_token } = await getAmadeusToken();

    const response = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?` +
        new URLSearchParams({
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: departureDate,
          adults: "1",
          max: "5",
          currencyCode: "USD",
        }),
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Amadeus API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Amadeus response to our Flight interface
    return data.data.map((offer: any) => {
      const segment = offer.itineraries[0].segments[0];

      // Calculate duration in hours and minutes
      const durationMatch = segment.duration.match(/PT(\d+)H(\d+)?M?/);
      const hours = durationMatch[1] || "0";
      const minutes = durationMatch[2] || "0";
      const formattedDuration = `${hours}h ${minutes}m`;

      // Format times
      const departureTime = new Date(segment.departure.at);
      const arrivalTime = new Date(segment.arrival.at);

      return {
        id: offer.id,
        airline: getAirlineName(segment.carrierCode),
        flightNumber: `${segment.carrierCode}${segment.number}`,
        origin: segment.departure.iataCode,
        destination: segment.arrival.iataCode,
        departureTime: departureTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        arrivalTime: arrivalTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        duration: formattedDuration,
        price: parseFloat(offer.price.total),
        currency: offer.price.currency,
      };
    });
  } catch (error) {
    console.error("Flight search error:", error);
    // If API fails, fall back to mock data
    return generateFlights(origin, destination);
  }
}

// Helper function to get airline name from carrier code
function getAirlineName(carrierCode: string): string {
  const airlines: { [key: string]: string } = {
    SQ: "Singapore Airlines",
    TG: "Thai Airways",
    GA: "Garuda Indonesia",
    MH: "Malaysia Airlines",
    PR: "Philippine Airlines",
    VN: "Vietnam Airlines",
    K6: "Cambodia Angkor Air",
    "8M": "Myanmar Airways",
    QV: "Lao Airlines",
    FD: "Thai AirAsia",
  };

  return airlines[carrierCode] || "Unknown Airline";
}
