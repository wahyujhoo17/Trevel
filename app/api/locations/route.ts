import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const AMADEUS_API = 'https://test.api.amadeus.com/v1';

async function getAccessToken() {
  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${process.env.AMADEUS_CLIENT_ID}&client_secret=${process.env.AMADEUS_CLIENT_SECRET}`
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();

    const response = await fetch(
      `${AMADEUS_API}/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(keyword)}`, 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Amadeus API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Location search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search locations' },
      { status: 500 }
    );
  }
}