'use client';

import { formatRelativeTime } from '@/lib/utils';

interface Props {
  iso: string;
  label?: string;
}

export default function LastUpdated({ iso, label = 'güncellendi' }: Props) {
  return (
    <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-800">
      <span className="pulse-dot bg-emerald-500" />
      <span className="text-xs text-slate-600">
        {formatRelativeTime(iso)} {label}
      </span>
    </div>
  );
}
