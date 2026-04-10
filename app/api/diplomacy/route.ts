import { NextResponse } from 'next/server';

const API_KEY = process.env.WARERA_API_KEY;

// Functie om de activiteit van een specifiek land te scannen
async function getDetailedWarStats(countryId: string) {
  try {
    const input = JSON.stringify({ countryId });
    
    async function getDetailedWarStats(countryId: string) {
  try {
    const input = JSON.stringify({ countryId });
  
    const usersRes = await fetch(`https://api2.warera.io/trpc/user.getUsersByCountry?input=${encodeURIComponent(input)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const usersJson = await usersRes.json();
    
    // DEBUG: Log de structuur als het weer misgaat
    // console.log("Raw users data:", JSON.stringify(usersJson));

    const userIds = usersJson.result?.data?.json || usersJson.result?.data || [];

    if (!Array.isArray(userIds)) {
      console.error(`UserIds voor ${countryId} is geen array maar:`, typeof userIds);
      return { name: "Data Error", activePlayers: 0, totalPlayers: 0, activityPercent: 0 };
    }

    if (userIds.length === 0) {
      const countryRes = await fetch(`https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(input)}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
        cache: 'force-cache'
      });
      const cJson = await countryRes.json();
      return { name: cJson.result?.data?.name || "Leeg land", activePlayers: 0, totalPlayers: 0, activityPercent: 0 };
    }

    const sampleIds = userIds.slice(0, 10);
    let activeCount = 0;

    await Promise.all(sampleIds.map(async (userId) => {
      try {
        const userInput = JSON.stringify({ userId });
        const userRes = await fetch(`https://api2.warera.io/trpc/user.getUserById?input=${encodeURIComponent(userInput)}`, {
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const userJson = await userRes.json();
        const lastSeen = new Date(userJson.result?.data?.lastConnectionAt);
        
        // Actief indien laatste connectie < 15 minuten geleden
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (lastSeen > fifteenMinsAgo) activeCount++;
      } catch (e) {
        // Individuele speler-error negeren
      }
    }));

    return {
      name: countryName,
      activePlayers: activeCount, // Aantal actieve spelers in de steekproef
      totalPlayers: userIds.length,
      // Percentage gebaseerd op de steekproef van 10
      activityPercent: Math.round((activeCount / sampleIds.length) * 100)
    };

  } catch (error) {
    console.error(`Fout bij scannen land ${countryId}:`, error);
    return { name: "Error", activePlayers: 0, totalPlayers: 0, activityPercent: 0 };
  }
}

export async function GET() {
  const LAND_ID = '6813b6d446e731854c7ac7a0';

  try {
    const input = JSON.stringify({ countryId: LAND_ID });
    const response = await fetch(`https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(input)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      cache: 'no-store'
    });
    
    const nlData = await response.json();
    const { allies, warsWith } = nlData.result.data;

    const [warStats, allyNames] = await Promise.all([
      Promise.all((warsWith || []).map((id: string) => getDetailedWarStats(id))),
      Promise.all((allies || []).map(async (id: string) => {
        const aInput = JSON.stringify({ countryId: id });
        const aRes = await fetch(`https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(aInput)}`, {
          headers: { 'Authorization': `Bearer ${API_KEY}` },
          cache: 'force-cache'
        });
        const aJson = await aRes.json();
        return aJson.result?.data?.name || "Onbekend";
      }))
    ]);

    return NextResponse.json({
      name: "Netherlands",
      allies: allyNames,
      wars: warStats
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}