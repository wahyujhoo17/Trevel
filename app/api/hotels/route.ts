import { NextResponse } from "next/server";
import { getJson } from "serpapi";
import dotenv from "dotenv";

dotenv.config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;

if (!SERPAPI_KEY) {
  throw new Error("SERPAPI_KEY is not defined in environment variables");
}

export async function GET(req: Request) {
  try {
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

    // Fetch data dari SerpAPI menggunakan getJson()
    const data = await new Promise((resolve, reject) => {
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

    // console.log("Raw SerpAPI data:", JSON.stringify(data, null, 2)); // Log the raw data

    // Map data dari properti 'properties'
    const hotels = (data?.properties || []).map((property: any) => ({
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
        property?.images?.map((image: any) => {
          // Prioritaskan gambar resolusi lebih tinggi
          return image.original_image || image.thumbnail;
        }) || [],
      link: property?.link || null,
    }));

    return NextResponse.json({ hotels }, { status: 200 });
    // console.log("API Response:", destination);
  } catch (error: any) {
    // console.error("❌ Error fetching hotels:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotels", details: error.message },
      { status: 500 }
    );
  }
}
