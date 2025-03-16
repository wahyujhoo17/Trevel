import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const airports = [
  { city: "Bali", code: "DPS", name: "Ngurah Rai International Airport" },
  { city: "Jakarta", code: "CGK", name: "Soekarno-Hatta International Airport" },
  { city: "Singapore", code: "SIN", name: "Changi Airport" },
  { city: "Bangkok", code: "BKK", name: "Suvarnabhumi Airport" },
  { city: "Kuala Lumpur", code: "KUL", name: "Kuala Lumpur International Airport" },
  { city: "Manila", code: "MNL", name: "Ninoy Aquino International Airport" },
  { city: "Ho Chi Minh", code: "SGN", name: "Tan Son Nhat International Airport" },
  { city: "Hanoi", code: "HAN", name: "Noi Bai International Airport" },
  { city: "Phuket", code: "HKT", name: "Phuket International Airport" }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  const filteredAirports = airports.filter(
    airport => 
      airport.city.toLowerCase().includes(query) || 
      airport.code.toLowerCase().includes(query) ||
      airport.name.toLowerCase().includes(query)
  );

  return NextResponse.json(filteredAirports);
}