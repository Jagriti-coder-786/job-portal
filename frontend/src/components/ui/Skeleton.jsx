export default function Skeleton({ className = '', lines = 1, circle }) {
  if (circle) {
    return <div className={`skeleton rounded-full ${className}`} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'} ${className}`} />
      ))}
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton circle className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}
