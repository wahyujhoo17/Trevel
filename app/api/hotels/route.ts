import { NextResponse } from "next/server";
import { getJson } from "serpapi";
import dotenv from "dotenv";

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

export async function GET(req: Request) {
  if (!SERPAPI_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");
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
    const data: SerpApiResponse = await new Promise((resolve) => {
      getJson(
        {
          engine: "google_hotels",
          q: destination,
          check_in_date: checkIn,
          check_out_date: checkOut,
          adults: adults,
          currency: "USD",
          gl: "us",
          hl: "en",
          api_key: SERPAPI_KEY,
        },
        (json) => resolve(json)
      );
    });

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 429 });
    }

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

    if (!hotels.length) {
      return NextResponse.json(
        { error: "No hotels found for this destination" },
        { status: 404 }
      );
    }

    return NextResponse.json({ hotels });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch hotels" },
      { status: 500 }
    );
  }
}
