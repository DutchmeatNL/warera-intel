import { NextResponse } from 'next/server';

const API_KEY = process.env.WARERA_API_KEY;
const NL_ID = '6813b6d446e731854c7ac7a0';

export async function GET() {
  try {
    // 1. Haal de globale Wealth Ranking op
    const rankingInput = JSON.stringify({ rankingType: "countryWealth" });
    const rankingRes = await fetch(`https://api2.warera.io/trpc/ranking.getRanking?input=${encodeURIComponent(rankingInput)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      cache: 'no-store'
    });
    const rankingJson = await rankingRes.json();
    const allRankings = rankingJson.result?.data?.items || [];

    // 2. Haal de basisgegevens van NL op (om te weten wie onze vijanden/bondgenoten zijn)
    const nlInput = JSON.stringify({ countryId: NL_ID });
    const nlRes = await fetch(`https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(nlInput)}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const nlJson = await nlRes.json();
    const nlData = nlJson.result?.data;

    const warsWith = nlData?.warsWith || [];
    const allies = nlData?.allies || [];

    // 3. Hulpfunctie om data uit de ranking te koppelen aan een land
    const getFinancialsFromRanking = (countryId: string) => {
      const record = allRankings.find((item: any) => item.country === countryId);
      return {
        id: countryId,
        wealth: record?.value || 0,
        rank: record?.rank || '?',
        tier: record?.tier || 'unknown'
      };
    };

    // 4. Haal namen op en combineer met ranking data
    // We doen dit alleen voor de relevante landen
    const fetchCountryWithWealth = async (id: string) => {
      const nameRes = await fetch(`https://api2.warera.io/trpc/country.getCountryById?input=${encodeURIComponent(JSON.stringify({ countryId: id }))}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
        cache: 'force-cache'
      });
      const nameJson = await nameRes.json();
      const financials = getFinancialsFromRanking(id);
      
      return {
        name: nameJson.result?.data?.name || "Onbekend",
        ...financials
      };
    };

    const [nlStats, warStats, allyStats] = await Promise.all([
      fetchCountryWithWealth(NL_ID),
      Promise.all(warsWith.map((id: string) => fetchCountryWithWealth(id))),
      Promise.all(allies.map((id: string) => fetchCountryWithWealth(id)))
    ]);

    return NextResponse.json({
      netherlands: nlStats,
      enemies: warStats,
      allies: allyStats
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}