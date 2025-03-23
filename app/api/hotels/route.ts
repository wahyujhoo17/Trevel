import { NextResponse } from "next/server";
import { getJson } from "serpapi";
import dotenv from "dotenv";
import { locations } from "@/data/locations";

// Add interfaces for type safety
interface SerpApiHotelProperty {
  name?: string;
  description?: string;
  logo?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  check_in_time?: string;
  check_out_time?: string;
  rate_per_night?: {
    lowest?: string;
  };
  overall_rating?: number;
  reviews?: number;
  amenities?: string[];
  images?: Array<{
    original_image?: string;
    thumbnail?: string;
  }>;
  link?: string;
}

interface SerpApiResponse {
  properties?: SerpApiHotelProperty[];
  error?: string;
}

dotenv.config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination");
  const destinationCode = searchParams.get("destinationCode");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults") || "2";

  if (!destination || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "Missing required search parameters" },
      { status: 400 }
    );
  }

  try {
    // First try the API call
    const response = await fetch(`your-hotel-api-endpoint`);
    const data = await response.json();

    if (data.error === "Your account has run out of searches.") {
      // Fallback to mock data
      const mockHotels = generateMockHotels(destination!, destinationCode!);
      return NextResponse.json({ hotels: mockHotels });
    }

    // Map data with proper typing
    const hotels = (data?.properties || []).map(
      (property: SerpApiHotelProperty) => ({
        name: property?.name || "Unknown Hotel",
        description: property?.description || "No description available",
        logo: property?.logo || null,
        gps_coordinates: property?.gps_coordinates || null,
        check_in_time: property?.check_in_time || "Unknown",
        check_out_time: property?.check_out_time || "Unknown",
        rate_per_night: property?.rate_per_night?.lowest || "N/A",
        overall_rating: property?.overall_rating || 0,
        reviews: property?.reviews || 0,
        amenities: property?.amenities || [],
        images:
          property?.images?.map(
            (image) => image.original_image || image.thumbnail
          ) || [],
        link: property?.link || null,
      })
    );

    return NextResponse.json({ hotels }, { status: 200 });
  } catch (error) {
    // Fallback to mock data on error
    const mockHotels = generateMockHotels(destination!, destinationCode!);
    return NextResponse.json({ hotels: mockHotels });
  }
}

function generateMockHotels(city: string, code: string) {
  // Generate some mock hotels based on the destination
  return [
    {
      id: `${code}-1`,
      name: `${city} Grand Hotel`,
      description: `Luxury hotel in the heart of ${city}`,
      rate_per_night: "$" + Math.floor(Math.random() * 10) + 100,
      overall_rating: (Math.random() * 2 + 3).toFixed(1),
      check_in_time: "12:00AM",
      check_out_time: "15:00PM",
      reviews: Math.floor(Math.random() * 1000),
      city: city,
      code: code,
      images: [
        "https://images.trvl-media.com/lodging/2000000/1110000/1102000/1101942/b2b0dad6.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
      ],
      amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    },
  ];
}
