'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [relations, setRelations] = useState<{allies: any[], enemies: any[]} | null>(null);

  useEffect(() => {
    fetch('api/diplomacy')
      .then(res => res.json())
      .then(data => setRelations(data));
  }, []);

  if (!relations) return <div className="p-8">Laden van diplomatieke status...</div>;

  return (
    <main className="p-8 bg-slate-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-orange-500">Nederland Intelligence Hub</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-slate-800 p-6 rounded-lg border border-red-900">
          <h2 className="text-xl font-bold mb-4 text-red-500">Vijanden ⚔️</h2>
          <ul>
            {relations.enemies.map((enemy: any) => (
              <li key={enemy.id} className="mb-2 p-2 bg-slate-700 rounded">
                {enemy.name} <span className="text-xs text-slate-400">({enemy.id})</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-slate-800 p-6 rounded-lg border border-blue-900">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Bondgenoten 🛡️</h2>
          <ul>
            {relations.allies.map((ally: any) => (
              <li key={ally.id} className="mb-2 p-2 bg-slate-700 rounded">
                {ally.name}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}