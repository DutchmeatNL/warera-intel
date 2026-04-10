import { NextResponse } from 'next/server';

const API_KEY = process.env.WARERA_API_KEY;
const LAND_ID = '6813b6d446e731854c7ac7a0';

async function getDetailedWarStats(countryId: string) {
  try {
    const input = JSON.stringify({ countryId });
    
    // 1. Haal User IDs op
    const usersRes = await fetch(`https://api2.warera.io/trpc/user.getUsersByCountry?input=${encodeURIComponent(input)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      cache: 'no-store'
    });
    const usersJson = await usersRes.json();

    // Veilig data uitpakken (tRPC v10 nesting check)
    let rawUserIds = usersJson.result?.data?.json || usersJson.result?.data;
    const userIds: string[] = Array.isArray(rawUserIds) ? rawUserIds : [];

    // 2. Naam van het land ophalen
    const countryRes = await fetch(`https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(input)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      cache: 'force-cache'
    });
    const countryJson = await countryRes.json();
    const countryName = countryJson.result?.data?.name || `Onbekend (${countryId.slice(-4)})`;

    if (userIds.length === 0) {
      return { name: countryName, activePlayers: 0, totalPlayers: 0, activityPercent: 0 };
    }

    // 3. Activiteit scannen (steekproef van 10)
    const sampleIds = userIds.slice(0, 10);
    let activeCount = 0;
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    await Promise.all(sampleIds.map(async (userId) => {
      try {
        const userInput = JSON.stringify({ userId });
        const uRes = await fetch(`https://api2.warera.io/trpc/user.getUserById?input=${encodeURIComponent(userInput)}`, {
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const uJson = await uRes.json();
        
        // Pak de user data uit (ook hier checken op .json nesting)
        const userData = uJson.result?.data?.json || uJson.result?.data;
        const lastSeen = userData?.lastConnectionAt ? new Date(userData.lastConnectionAt) : null;

        if (lastSeen && lastSeen > fifteenMinsAgo) {
          activeCount++;
        }
      } catch (e) {
        // Individuele speler negeren
      }
    }));

    return {
      name: countryName,
      activePlayers: activeCount,
      totalPlayers: userIds.length,
      activityPercent: Math.round((activeCount / sampleIds.length) * 100)
    };

  } catch (error: any) {
    console.error(`Gefaalde scan voor land ${countryId}:`, error.message);
    return { name: "Scan Error", activePlayers: 0, totalPlayers: 0, activityPercent: 0 };
  }
}

export async function GET() {
  try {
    if (!API_KEY) throw new Error("API Key ontbreekt in environment variables");

    // 1. Basis info Nederland
    const input = JSON.stringify({ countryId: LAND_ID });
    const response = await fetch(`https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(input)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      cache: 'no-store'
    });
    
    const nlData = await response.json();
    const data = nlData.result?.data;

    if (!data) {
      return NextResponse.json({ error: "Geen data ontvangen van WarEra" }, { status: 500 });
    }

    const allies = data.allies || [];
    const warsWith = data.warsWith || [];

    // 2. Haal alle stats parallel op
    const [warStats, allyNames] = await Promise.all([
      Promise.all(warsWith.map((id: string) => getDetailedWarStats(id))),
      Promise.all(allies.map(async (id: string) => {
        try {
          const aInput = JSON.stringify({ countryId: id });
          const aRes = await fetch(`https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(aInput)}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            cache: 'force-cache'
          });
          const aJson = await aRes.json();
          return aJson.result?.data?.name || "Onbekend Bondgenoot";
        } catch {
          return "Error laden";
        }
      }))
    ]);

    return NextResponse.json({
      name: data.name || "Netherlands",
      allies: allyNames,
      wars: warStats
    });

  } catch (error: any) {
    console.error("Critical API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}