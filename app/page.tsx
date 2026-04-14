'use client';
import { useEffect, useState } from 'react';

export default function IntelligenceDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/diplomacy').then(r => r.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-zinc-500 font-mono text-xs tracking-widest">
      INITIALIZING SYSTEM...
    </div>
  );

  // Sorteren op wealth (hoog naar laag)
  const sortedEnemies = [...data.enemies].sort((a, b) => b.wealth - a.wealth);
  const sortedAllies = [...data.allies].sort((a, b) => b.wealth - a.wealth);

  const formatMoney = (n: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', currency: 'USD', maximumFractionDigits: 0 
  }).format(n);

  // Berekeningen voor de Power Balance
  const enemyTotal = sortedEnemies.reduce((acc, curr) => acc + curr.wealth, 0);
  const allyTotal = sortedAllies.reduce((acc, curr) => acc + curr.wealth, 0) + data.netherlands.wealth;
  const ratio = (allyTotal / (allyTotal + enemyTotal)) * 100;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Sectie */}
        <header className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-zinc-500 text-[10px] tracking-[0.4em] uppercase mb-2">Sovereign State</h1>
              <h2 className="text-4xl font-light text-white tracking-tight">NETHERLANDS</h2>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 text-[10px] tracking-[0.4em] uppercase block mb-1">Total Assets</span>
              <span className="text-2xl font-mono text-white">{formatMoney(data.netherlands.wealth)}</span>
            </div>
          </div>

          {/* Power Balance Indicator */}
          <div className="relative h-[2px] w-full bg-zinc-800 mt-8">
            <div 
              className="absolute h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${ratio}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[9px] font-mono uppercase tracking-widest text-zinc-600">
            <span>Coalition Power: {ratio.toFixed(1)}%</span>
            <span>Opponent Power: {(100 - ratio).toFixed(1)}%</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Oorlogslanden (Gesorteerd) */}
          <section>
            <h3 className="text-white text-[10px] tracking-[0.3em] uppercase mb-8 pb-2 border-b border-zinc-800">
              Hostile Economies <span className="text-red-900 ml-2">///</span>
            </h3>
            <div className="space-y-6">
              {sortedEnemies.map((enemy: any, i: number) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                      {enemy.name} <span className="text-zinc-700 ml-2 font-mono text-[10px]">RANK #{enemy.rank}</span>
                    </span>
                    <span className="text-xs font-mono text-zinc-500">{formatMoney(enemy.wealth)}</span>
                  </div>
                  <div className="h-[1px] w-full bg-zinc-900">
                    <div 
                      className="h-full bg-red-900/40 transition-all duration-700" 
                      style={{ width: `${Math.min((enemy.wealth / data.netherlands.wealth) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bondgenoten (Gesorteerd) */}
          <section>
            <h3 className="text-white text-[10px] tracking-[0.3em] uppercase mb-8 pb-2 border-b border-zinc-800">
              Allied Economies <span className="text-blue-900 ml-2">///</span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {sortedAllies.map((ally: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-600 block mb-0.5">#{ally.rank}</span>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider">{ally.name}</span>
                  </div>
                  <span className="text-xs font-mono text-blue-900">{formatMoney(ally.wealth)}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        <footer className="mt-20 pt-8 border-t border-zinc-900 flex justify-between items-center text-[9px] text-zinc-700 font-mono tracking-widest uppercase">
          <span>Operational Intelligence v3.0</span>
          <span className="animate-pulse">System Live</span>
        </footer>
      </div>
    </main>
  );
}