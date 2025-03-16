import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function getAmadeusToken() {
  try {
    const response = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.AMADEUS_CLIENT_ID || "",
          client_secret: process.env.AMADEUS_CLIENT_SECRET || "",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get access token");
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Token fetch error:", error);
    throw new Error("Authentication failed");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");

    if (!keyword || keyword.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const token = await getAmadeusToken();
    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(
        keyword
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Amadeus API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Airport search error:", error);
    return NextResponse.json(
      { error: "Failed to search airports" },
      { status: 500 }
    );
  }
}
