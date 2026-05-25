'use client';

interface Props {
  change: number;
  direction: 'up' | 'down' | 'flat';
  size?: 'sm' | 'md';
}

export default function PriceChange({ change, direction, size = 'md' }: Props) {
  const isUp = direction === 'up';
  const isDown = direction === 'down';

  const bg = isUp
    ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
    : isDown
    ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
    : 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20';

  const arrow = isUp ? '▲' : isDown ? '▼' : '—';
  const sign = change > 0 ? '+' : '';
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold tabular-nums ${bg} ${textSize}`}>
      <span className="text-[10px]">{arrow}</span>
      {sign}{Math.abs(change).toFixed(2)}%
    </span>
  );
}
