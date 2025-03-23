import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Add interface for type safety
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

async function getDestinationsFromJson(): Promise<Destination[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "destinations.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    return data.data || [];
  } catch (error) {
    return [];
  }
}

export async function GET() {
  try {
    const destinations = await getDestinationsFromJson();

    if (!destinations.length) {
      return NextResponse.json(
        { error: "No destinations found" },
        { status: 404 }
      );
    }

    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Failed to get destinations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch destinations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
