import { GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page header skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-48 bg-gray-200" />
        <Skeleton className="h-4 w-96 bg-gray-200" />
      </div>
      
      {/* Search form skeleton */}
      <div className="mb-8 flex gap-2">
        <Skeleton className="h-10 flex-1 bg-gray-200 rounded" />
        <Skeleton className="h-10 w-20 bg-gray-200 rounded" />
      </div>
      
      {/* Results skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-32 bg-gray-200" />
        <GridSkeleton count={6} />
      </div>
    </div>
  );
} 