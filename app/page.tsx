'use client';
import { useEffect, useState } from 'react';

interface DiplomacyData {
  name: string;
  allies: string[];
  wars: string[];
}

export default function Home() {
  const [data, setData] = useState<DiplomacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/diplomacy');
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (error) {
      console.error("Fout bij ophalen data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Ververs de data elke 60 seconden
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">WarEra Intelligence Hub laden...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 bg-slate-950 min-h-screen text-slate-100">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-orange-500 tracking-tight">
            NETHERLANDS <span className="text-slate-500 text-xl font-normal ml-2">INTEL HUB</span>
          </h1>
          <p className="text-slate-400 mt-1">Real-time diplomatieke status monitoring</p>
        </div>
        <div className="text-right text-xs text-slate-500 font-mono">
          LAATSTE UPDATE: {lastUpdated}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Oorlog Sectie */}
        <section className="bg-slate-900 rounded-xl border border-red-900/30 overflow-hidden shadow-2xl">
          <div className="bg-red-950/40 p-4 border-b border-red-900/30 flex justify-between items-center">
            <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
              <span className="animate-pulse">⚔️</span> ACTIEVE OORLOGEN
            </h2>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {data?.wars.length || 0}
            </span>
          </div>
          <div className="p-4">
            {data?.wars && data.wars.length > 0 ? (
              <ul className="space-y-3">
                {data.wars.map((country: string, index: number) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <span className="font-semibold text-lg">{country}</span>
                    <span className="text-[10px] bg-red-900/20 text-red-400 border border-red-900/50 px-2 py-1 rounded uppercase tracking-wider">Hostile</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic text-center py-8 text-sm">Geen actieve conflicten gevonden.</p>
            )}
          </div>
        </section>

        {/* Bondgenoten Sectie */}
        <section className="bg-slate-900 rounded-xl border border-blue-900/30 overflow-hidden shadow-2xl">
          <div className="bg-blue-950/40 p-4 border-b border-blue-900/30 flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
              🛡️ BONDGENOTEN
            </h2>
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {data?.allies.length || 0}
            </span>
          </div>
          <div className="p-4">
            {data?.allies && data.allies.length > 0 ? (
              <ul className="space-y-3">
                {data.allies.map((country: string, index: number) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <span className="font-semibold text-lg">{country}</span>
                    <span className="text-[10px] bg-blue-900/20 text-blue-400 border border-blue-900/50 px-2 py-1 rounded uppercase tracking-wider">Allied</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic text-center py-8 text-sm">Geen actieve allianties gevonden.</p>
            )}
          </div>
        </section>

      </div>

      {/* Footer / Status bar */}
      <footer className="max-w-6xl mx-auto mt-12 pt-6 border-t border-slate-900 text-center">
        <p className="text-slate-600 text-sm">
          WarEra Intelligence Hub v1.0 — Verbinding met <code className="text-slate-500">api2.warera.io</code>
        </p>
      </footer>
    </main>
  );
}