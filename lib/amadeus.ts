import Amadeus from "amadeus";

const AMADEUS_CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || "";
const AMADEUS_CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET || "";
const AMADEUS_API_URL = "https://test.api.amadeus.com";

export interface AmadeusToken {
  access_token: string;
  expires_in: number;
}

export async function getAmadeusToken(): Promise<AmadeusToken> {
  const response = await fetch(`${AMADEUS_API_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: AMADEUS_CLIENT_ID,
      client_secret: AMADEUS_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get Amadeus token");
  }

  return response.json();
}

export async function getFlightOffers(
  origin: string,
  destination: string,
  departureDate: string
) {
  try {
    const tokenResponse = await fetch(
      `${AMADEUS_API_URL}/v1/security/oauth2/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
      }
    );

    const { access_token } = await tokenResponse.json();

    const response = await fetch(
      `${AMADEUS_API_URL}/v2/shopping/flight-offers?` +
        new URLSearchParams({
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: departureDate,
          adults: "1",
          max: "5",
        }),
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Amadeus API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Amadeus API error:", error);
    throw error;
  }
}

const amadeus = new Amadeus({
  clientId: AMADEUS_CLIENT_ID,
  clientSecret: AMADEUS_CLIENT_SECRET,
});

export default amadeus;
