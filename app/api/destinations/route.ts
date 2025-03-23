import { NextResponse } from "next/server";
import { GoogleSearch } from "google-search-results-nodejs";
import { getCachedData, setCachedData } from "@/utils/cache";
import { NextApiRequest, NextApiResponse } from "next";

const SERPAPI_KEY = process.env.SERPAPI_KEY;

if (!SERPAPI_KEY) {
  throw new Error("SERPAPI_KEY is not defined in environment variables");
}

const search = new GoogleSearch(SERPAPI_KEY);

// Add interface for better type checking
interface Destination {
  id: number;
  name: string;
  description: string;
  image: string;
  location: string;
  prices: {
    flight: {
      amount: string;
      extracted: number | null;
    };
    hotel: {
      amount: string;
      extracted: number | null;
    };
  };
  link: string;
}

// Update the helper function to always return a string
const getHighQualityImage = async (
  destinationName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    search.json(
      {
        engine: "google_images",
        q: `${destinationName} tourist destination landscape hd`,
        google_domain: "google.com",
        gl: "sg",
        hl: "en",
        num: "1",
        safe: "active",
        tbs: "isz:l,ic:specific,isc:rgb,sur:fmc",
      },
      (data: any) => {
        if (data.error) reject(data.error);
        const image = data.images_results?.[0];
        // Provide a fallback image URL if no image is found
        resolve(
          image?.original || image?.thumbnail || "/images/placeholder.jpg"
        );
      }
    );
  });
};

export async function GET() {
  try {
    // Try to get cached data first
    const cachedDestinations = await getCachedData("destinations.json");

    if (cachedDestinations) {
      return NextResponse.json(cachedDestinations);
    }

    // If no cache or expired, fetch new data
    const getResults = () => {
      return new Promise((resolve, reject) => {
        search.json(
          {
            engine: "google",
            q: "Best tourist destinations in Southeast Asia",
            google_domain: "google.com",
            gl: "sg", // Singapore as location context
            hl: "en", // English language
            num: "9",
          },
          (data: any) => {
            if (data.error) reject(data.error);
            resolve(data);
          }
        );
      });
    };

    const data: any = await getResults();
    // console.log("API Response:", JSON.stringify(data, null, 2));

    // Get destinations with separated prices
    let destinations: Destination[] =
      data.popular_destinations?.destinations
        ?.slice(0, 9)
        .map((item: any, index: number) => ({
          id: index + 1,
          name: item.title,
          description: item.description || "Explore this beautiful destination",
          image: "", // Will be populated with high quality image
          location: item.title,
          prices: {
            flight: {
              amount: item.flight_price || "Price on request",
              extracted: item.extracted_flight_price || null,
            },
            hotel: {
              amount: item.hotel_price || "From $100/night",
              extracted: item.extracted_hotel_price || null,
            },
          },
          link: item.link,
        })) || [];

    // Update the image fetching logic
    destinations = await Promise.all(
      destinations.map(async (dest) => {
        try {
          const highQualityImage = await getHighQualityImage(dest.name);
          return {
            ...dest,
            image: highQualityImage || "/images/placeholder.jpg", // Ensure we always have a string
          };
        } catch (error) {
          console.error(`Failed to fetch image for ${dest.name}:`, error);
          return {
            ...dest,
            image: "/images/placeholder.jpg", // Fallback image on error
          };
        }
      })
    );

    if (destinations.length > 0) {
      // Cache the results
      await setCachedData("destinations.json", destinations);
    } else {
      console.warn("No destinations found in the API response");
    }

    return NextResponse.json(destinations);
  } catch (error) {
    // Try to use cached data as fallback if API fails
    const cachedDestinations = await getCachedData("destinations.json");
    if (cachedDestinations) {
      return NextResponse.json(cachedDestinations);
    }

    console.error("Destination fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch destinations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
