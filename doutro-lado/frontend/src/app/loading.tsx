import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function Loading() {
  return (
    <main className="px-6 py-16">
      <div className="mx-auto grid max-w-luxe gap-6">
        <SkeletonCard className="h-[320px]" />
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonCard className="h-[280px]" />
          <SkeletonCard className="h-[280px]" />
          <SkeletonCard className="h-[280px]" />
        </div>
      </div>
    </main>
  );
}
