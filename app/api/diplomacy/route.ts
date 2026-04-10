import { NextResponse } from 'next/server';

export async function GET() {
  const LAND_ID = '6813b6d446e731854c7ac7a0';
  const API_KEY = process.env.WARERA_API_KEY;


  const inputObject = { 
    countryId: LAND_ID 
  };
  
  const targetUrl = `https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(JSON.stringify(inputObject))}`;

  console.log("Nieuwe GET poging naar:", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    const jsonResponse = await response.json();

    if (!response.ok) {
      console.error("WarEra API Error:", response.status, JSON.stringify(jsonResponse));
      return NextResponse.json({ error: "API Error", details: jsonResponse }, { status: response.status });
    }

    const data = jsonResponse.result?.data;

    if (!data) {
      console.log("Structuur van de response was anders:", JSON.stringify(jsonResponse));
      return NextResponse.json({ error: "Data-veld niet gevonden" }, { status: 404 });
    }

    return NextResponse.json({
      name: data.name || "Nederland",
      allies: data.allies || [],
      enemies: data.warsWith || []
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Fetch mislukt", details: error.message }, { status: 500 });
  }
}