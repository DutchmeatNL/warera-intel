'use client';
import { useEffect, useState } from 'react';

export default function PowerDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/diplomacy').then(r => r.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-orange-500 font-mono animate-pulse">
      SYNCING WITH GLOBAL RANKINGS...
    </div>
  );

  const formatMoney = (n: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(n);

  const getTierColor = (tier: string) => {
    const t = tier.toLowerCase();
    if (t.includes('master')) return 'text-purple-400 border-purple-400';
    if (t.includes('diamond')) return 'text-blue-300 border-blue-300';
    if (t.includes('gold')) return 'text-yellow-500 border-yellow-500';
    return 'text-slate-400 border-slate-400';
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 p-4 md:p-12 font-sans tracking-tight">
      
      {/* Top Bar: NL Status */}
      <div className="max-w-6xl mx-auto mb-16 border-b border-white/10 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-6xl font-black text-white italic tracking-tighter">NETHERLANDS</h1>
            <div className="flex gap-4 mt-2">
              <span className={`px-2 py-1 border text-xs font-bold uppercase ${getTierColor(data.netherlands.tier)}`}>
                {data.netherlands.tier} Tier
              </span>
              <span className="text-slate-500 text-xs font-mono uppercase self-center">
                Global Rank: <span className="text-white">#{data.netherlands.rank}</span>
              </span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-5xl font-light text-emerald-400 font-mono tracking-tighter">
              {formatMoney(data.netherlands.wealth)}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Total Sovereign Wealth</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Enemies Column */}
        <section>
          <div className="flex justify-between items-center mb-8 border-l-4 border-red-600 pl-4">
            <h3 className="text-xl font-bold uppercase italic">Threat Assessment</h3>
            <span className="text-red-600 text-xs font-mono">WARS: {data.enemies.length}</span>
          </div>
          
          <div className="space-y-8">
            {data.enemies.map((enemy: any, i: number) => (
              <div key={i} className="group relative">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-xs text-slate-500 font-mono block mb-1">RANK #{enemy.rank}</span>
                    <h4 className="text-2xl font-bold uppercase">{enemy.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono text-slate-300">{formatMoney(enemy.wealth)}</span>
                  </div>
                </div>
                {/* Visual Wealth Bar */}
                <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all duration-1000" 
                    style={{ width: `${Math.min((enemy.wealth / data.netherlands.wealth) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className={`text-[10px] font-bold uppercase ${getTierColor(enemy.tier)}`}>
                    {enemy.tier}
                  </span>
                  <span className="text-[10px] text-slate-600 uppercase font-mono">
                    Power Ratio: {((enemy.wealth / data.netherlands.wealth) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Allies Column */}
        <section>
          <div className="flex justify-between items-center mb-8 border-l-4 border-blue-600 pl-4">
            <h3 className="text-xl font-bold uppercase italic">Allied Support</h3>
            <span className="text-blue-500 text-xs font-mono">COALITION: {data.allies.length}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.allies.map((ally: any, i: number) => (
              <div key={i} className="p-4 bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-mono text-slate-500">#{ally.rank}</span>
                  <span className={`text-[8px] border px-1 ${getTierColor(ally.tier)}`}>{ally.tier}</span>
                </div>
                <h4 className="font-bold uppercase truncate">{ally.name}</h4>
                <p className="text-sm font-mono text-blue-400 mt-1">{formatMoney(ally.wealth)}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      <footer className="max-w-6xl mx-auto mt-24 pt-8 border-t border-white/5 flex justify-between text-[10px] text-slate-600 font-mono uppercase tracking-[0.3em]">
        <span>Encrypted Connection Active</span>
        <span>WarEra Global Index v2.1</span>
      </footer>
    </main>
  );
}