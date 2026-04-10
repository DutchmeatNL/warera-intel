import { NextResponse } from 'next/server';

export async function GET() {
  const NEDERLAND_ID = '6813b6d446e731854c7ac7a0'; // Check of dit een string is, bijv: '10'
  const API_KEY = process.env.WARERA_API_KEY;

  console.log("Systeem probeert verbinding te maken met ID:", NEDERLAND_ID);
  console.log("API Key aanwezig?:", !!API_KEY);

  try {
    const response = await fetch(`https://api.warero.io/country/getCountryById?countryId=${NEDERLAND_ID}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      cache: 'no-store' // Zorgt dat we altijd verse data krijgen
    });
    
    if (!response.ok) {
      console.error("WarEra API gaf een foutmelding:", response.status);
      return NextResponse.json({ error: `WarEra API Error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("Data succesvol ontvangen voor:", data.name);

    // Als de velden 'allies' of 'enemies' niet bestaan, sturen we lege lijsten
    return NextResponse.json({
      allies: data.allies || [],
      enemies: data.warsWith || []
    });
  } catch (error: any) {
    console.error("Critical Error in Route:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}