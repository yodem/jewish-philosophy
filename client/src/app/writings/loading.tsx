import { GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function WritingsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32 bg-gray-200" />
      </div>
      
      {/* Page header skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-48 bg-gray-200" />
        <Skeleton className="h-4 w-96 bg-gray-200" />
      </div>
      
      {/* Writings grid */}
      <div className="w-full">
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <Skeleton className="h-6 w-32 bg-gray-200 mb-4" />
          <GridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
} 