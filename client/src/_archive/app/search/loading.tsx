import { GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page header skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-4 w-96 bg-muted" />
      </div>
      
      {/* Search form skeleton */}
      <div className="mb-8 flex gap-2">
        <Skeleton className="h-10 flex-1 bg-muted rounded" />
        <Skeleton className="h-10 w-20 bg-muted rounded" />
      </div>
      
      {/* Results skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-32 bg-muted" />
        <GridSkeleton count={6} />
      </div>
    </div>
  );
} 