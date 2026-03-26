import { Skeleton } from "@/components/ui/skeleton";
import HomeContentGridSkeleton from "@/components/home/HomeContentGridSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-muted/50 px-6 py-16 text-center md:px-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="mx-auto h-12 w-3/4" />
          <Skeleton className="mx-auto h-6 w-2/3" />
          <Skeleton className="mx-auto h-14 w-48 rounded-lg" />
        </div>
      </div>

      {/* Content grid skeleton */}
      <HomeContentGridSkeleton />

      {/* Newsletter skeleton */}
      <div className="mt-8 animate-pulse border-t border-border bg-muted/50 p-8 md:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <Skeleton className="mx-auto mb-2 h-7 w-48" />
          <Skeleton className="mx-auto mb-8 h-5 w-80" />
          <div className="flex flex-col gap-4 md:flex-row">
            <Skeleton className="h-14 flex-1 rounded-lg" />
            <Skeleton className="h-14 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
