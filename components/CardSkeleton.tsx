export default function CardSkeleton({ rows = 3, title }: { rows?: number; title?: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="skeleton w-7 h-7 rounded-lg" />
        {title ? (
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">{title}</span>
        ) : (
          <div className="skeleton h-3 w-28" />
        )}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="space-y-1.5">
              <div className="skeleton h-2.5 w-16" />
              <div className="skeleton h-5 w-28" />
            </div>
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
