import { CardSkeleton, GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
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
      
      {/* Featured blog skeleton */}
      <div className="mb-8 sm:mb-12 flex flex-col items-center px-2 border-b border-gray-200 pb-8 w-full">
        <Skeleton className="h-6 w-32 bg-gray-200 mb-4" />
        <div className="w-full max-w-md sm:max-w-3xl">
          <CardSkeleton className="w-full" />
        </div>
        <div className="w-full flex flex-col items-center justify-center gap-4 mt-4">
          <Skeleton className="h-6 w-24 bg-gray-200" />
          <div className="space-y-2 max-w-2xl w-full text-center">
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-3/4 mx-auto bg-gray-200" />
          </div>
        </div>
      </div>
      
      {/* Additional blogs section */}
      <div className="w-full">
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <Skeleton className="h-6 w-32 bg-gray-200 mb-4" />
          <GridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
} 