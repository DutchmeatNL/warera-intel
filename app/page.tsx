'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [rawData, setRawData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/diplomacy')
      .then(res => res.json())
      .then(data => setRawData(data));
  }, []);

  if (!rawData) return <div className="p-8 text-white">Verbinding maken met WarEra...</div>;

  return (
    <main className="p-8 bg-slate-900 min-h-screen text-white font-mono">
      <h1 className="text-2xl font-bold mb-4 text-orange-500">Raw Data Scanner</h1>
      <pre className="bg-black p-4 rounded border border-slate-700 overflow-auto max-h-[80vh] text-xs">
        {JSON.stringify(rawData, null, 2)}
      </pre>
    </main>
  );
}