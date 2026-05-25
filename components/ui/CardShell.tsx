import { ReactNode } from 'react';

interface CardShellProps {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  glow?: 'green' | 'red' | 'blue' | 'violet' | 'none';
  accent?: 'green' | 'red' | 'blue' | 'violet' | 'amber' | 'none';
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

const GLOW: Record<string, string> = {
  green: 'glow-green',
  red: 'glow-red',
  blue: 'glow-blue',
  violet: 'glow-violet',
  none: '',
};

const ACCENT: Record<string, string> = {
  green: 'card-accent-green',
  red: 'card-accent-red',
  blue: 'card-accent-blue',
  violet: 'card-accent-violet',
  amber: 'card-accent-amber',
  none: '',
};

export default function CardShell({
  icon,
  title,
  badge,
  glow = 'none',
  accent = 'none',
  footer,
  className = '',
  children,
}: CardShellProps) {
  return (
    <div
      className={`glass glass-hover rounded-2xl p-5 flex flex-col ${GLOW[glow]} ${ACCENT[accent]} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="card-icon">{icon}</div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {title}
          </span>
        </div>
        {badge}
      </div>
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  );
}
