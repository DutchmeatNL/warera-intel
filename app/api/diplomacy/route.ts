import { NextResponse } from 'next/server';

const API_KEY = process.env.WARERA_API_KEY;

async function getCountryName(id: string) {
  const input = JSON.stringify({ countryId: id });
  const url = `https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(input)}`;
  
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      cache: 'force-cache' 
    });
    const json = await res.json();
    return json.result?.data?.name || `Onbekend (${id.slice(-4)})`;
  } catch {
    return `Error (${id.slice(-4)})`;
  }
}

export async function GET() {
  const LAND_ID = '6813b6d446e731854c7ac7a0';

  try {
    const input = JSON.stringify({ countryId: LAND_ID });
    const response = await fetch(`https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(input)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const nlData = await response.json();
    
    const { allies, warsWith } = nlData.result.data;

    const [allyNames, warNames] = await Promise.all([
      Promise.all((allies || []).map((id: string) => getCountryName(id))),
      Promise.all((warsWith || []).map((id: string) => getCountryName(id)))
    ]);

    return NextResponse.json({
      name: "Netherlands",
      allies: allyNames,
      wars: warNames
    });

  } catch (error: any) {
    console.error("Fout bij ophalen oorlogsdata:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}