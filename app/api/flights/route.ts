import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET;

async function getAccessToken() {
  const response = await fetch(
    "https://test.api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mendapatkan token");
  }

  const data = await response.json();
  return data.access_token;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departureDate = searchParams.get("departureDate");

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: "Parameter tidak lengkap" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getAccessToken(); // Ambil token baru setiap request
    const apiUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=1`;

    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Gagal mendapatkan data", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
