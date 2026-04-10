import { NextResponse } from 'next/server';

export async function GET() {
  const LAND_ID = '6813b6d446e731854c7ac7a0';
  const API_KEY = process.env.WARERA_API_KEY;

 
  const input = JSON.stringify({ id: LAND_ID });
  const targetUrl = `https://api2.warera.io/trpc/country.getCountryById?batch=1&input=${encodeURIComponent(input)}`;

  console.log("Poging tot tRPC call naar:", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: { 
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("WarEra tRPC Error:", response.status, errorText);
      return NextResponse.json({ error: `Status ${response.status}` }, { status: response.status });
    }

    const jsonResponse = await response.json();
    
    const data = jsonResponse[0]?.result?.data || jsonResponse.result?.data;

    if (!data) {
      console.log("Geen data gevonden in tRPC response:", JSON.stringify(jsonResponse));
      return NextResponse.json({ error: "Geen data in response" }, { status: 404 });
    }

    return NextResponse.json({
      name: data.name || "Nederland",
      allies: data.allies || [],
      enemies: data.warsWith || []
    });

  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    return NextResponse.json({ error: "Verbinding mislukt", details: error.message }, { status: 500 });
  }
}