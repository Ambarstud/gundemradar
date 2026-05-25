'use client';

import { useSWRConfig } from 'swr';
import { useState } from 'react';

export default function RefreshButton() {
  const { mutate } = useSWRConfig();
  const [spinning, setSpinning] = useState(false);

  async function handleRefresh() {
    setSpinning(true);
    await mutate(() => true, undefined, { revalidate: true });
    setTimeout(() => setSpinning(false), 900);
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={spinning}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-100 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.14] transition-all disabled:opacity-40 active:scale-95"
      title="Tüm verileri yenile"
    >
      <svg
        className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span className="hidden sm:inline">{spinning ? 'Yenileniyor' : 'Yenile'}</span>
    </button>
  );
}
