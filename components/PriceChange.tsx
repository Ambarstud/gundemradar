'use client';

interface Props {
  change: number;
  direction: 'up' | 'down' | 'flat';
  size?: 'sm' | 'md' | 'lg';
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

  const sizeClass =
    size === 'lg' ? 'text-sm px-2.5 py-1' :
    size === 'sm' ? 'text-[10px] px-1.5 py-0.5' :
    'text-xs px-2 py-0.5';

  const arrowSize = size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full font-semibold tabular-nums whitespace-nowrap ${bg} ${sizeClass}`}>
      <span className={arrowSize}>{arrow}</span>
      {sign}{Math.abs(change).toFixed(2)}%
    </span>
  );
}
