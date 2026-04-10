import { NextResponse } from 'next/server';

export async function POST() { 
  const LAND_ID = '6813b6d446e731854c7ac7a0';
  const API_KEY = process.env.WARERA_API_KEY;

  const targetUrl = `https://api2.warera.io/trpc/country.getCountryById?batch=1`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      
      body: JSON.stringify({
        "0": { id: LAND_ID }
      }),
      cache: 'no-store'
    });
    
    const jsonResponse = await response.json();

    if (!response.ok) {
      console.error("WarEra tRPC Error Details:", JSON.stringify(jsonResponse));
      return NextResponse.json({ error: "API Error", details: jsonResponse }, { status: response.status });
    }

  
    const data = jsonResponse[0]?.result?.data;

    if (!data) {
      return NextResponse.json({ error: "Geen data gevonden in response" }, { status: 404 });
    }

    return NextResponse.json({
      name: data.name || "Nederland",
      allies: data.allies || [],
      enemies: data.enemies || []
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Verbinding mislukt", details: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}