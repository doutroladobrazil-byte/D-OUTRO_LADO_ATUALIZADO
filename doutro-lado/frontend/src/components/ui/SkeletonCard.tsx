export function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[24px] border border-white/8 bg-white/[0.04] ${className}`} />;
}
