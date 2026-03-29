import { GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Page header skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Search form skeleton */}
      <div className="mb-8 flex gap-2">
        <Skeleton className="h-10 flex-1 rounded" />
        <Skeleton className="h-10 w-20 rounded" />
      </div>

      {/* Results skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <GridSkeleton count={6} />
      </div>
    </div>
  );
}
