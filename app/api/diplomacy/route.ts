import { NextResponse } from 'next/server';

export async function GET() {
    const NEDERLAND_ID = '6813b6d446e731854c7ac7a0';
    const API_KEY = process.env.WARERA_API_KEY;

    try {
    const response = await fetch(`https://api.warero.io/country/getCountryById?countryId=${NEDERLAND_ID}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    const data = await response.json();

    const relations = {
        allies: data.allies || [],
        enemies: data.warsWith || []
    };

    return NextResponse.json(relations);
    } catch (error) {
        return NextResponse.json({ error: 'Kon diplomatie niet ophalen' }, { status: 500 });
    }
}