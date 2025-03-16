import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Remove edge runtime for now to debug
export const dynamic = "force-dynamic";

// Interface for location data
interface Location {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    state?: string;
    country: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] });
    }

    // Mock data for testing
    const mockLocations = [
      {
        id: "1",
        name: "Bali",
        code: "LOC1",
        city: "Denpasar",
        country: "Indonesia",
        coordinates: { lat: -8.3405, lon: 115.092 },
      },
      {
        id: "2",
        name: "Bangkok",
        code: "LOC2",
        city: "Bangkok",
        country: "Thailand",
        coordinates: { lat: 13.7563, lon: 100.5018 },
      },
      {
        id: "3",
        name: "Singapore",
        code: "LOC3",
        city: "Singapore",
        country: "Singapore",
        coordinates: { lat: 1.3521, lon: 103.8198 },
      },
    ].filter(
      (location) =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.city.toLowerCase().includes(query.toLowerCase()) ||
        location.country.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ data: mockLocations });
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json(
      { error: "Failed to search locations" },
      { status: 500 }
    );
  }
}
