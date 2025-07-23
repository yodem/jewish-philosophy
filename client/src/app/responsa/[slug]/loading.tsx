import { ContentSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ResponsaLoading() {
  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-48 bg-gray-200" />
      </div>
      
      <div className="max-w-3xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-8 w-3/4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32 bg-gray-200" />
            <Skeleton className="h-4 w-20 bg-gray-200" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 bg-gray-200 rounded-full" />
            <Skeleton className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="bg-gray-50 p-6 rounded-lg mb-12">
          <ContentSkeleton />
        </div>
        
        {/* Comments section skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-6 w-32 bg-gray-200" />
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24 bg-gray-200" />
                <Skeleton className="h-4 w-20 bg-gray-200" />
              </div>
              <Skeleton className="h-20 w-full bg-gray-200" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28 bg-gray-200" />
                <Skeleton className="h-4 w-16 bg-gray-200" />
              </div>
              <Skeleton className="h-16 w-full bg-gray-200" />
            </div>
          </div>
          
          {/* Comment form skeleton */}
          <div className="mt-12 space-y-4">
            <Skeleton className="h-6 w-32 bg-gray-200" />
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <Skeleton className="h-10 w-full bg-gray-200" />
              <Skeleton className="h-32 w-full bg-gray-200" />
              <Skeleton className="h-10 w-24 bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 