import { Skeleton } from "@/components/ui/skeleton";

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                {/* Chip */}
                <Skeleton className="h-6 w-20 bg-gray-200" />
                
                {/* Large log text */}
                <Skeleton className="h-8 w-full bg-gray-200" />
                
                {/* Two texts separated by dot */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                  <Skeleton className="h-2 w-2 bg-gray-200 rounded-full" />
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                </div>
                
                {/* Big image */}
                <Skeleton className="h-48 w-full bg-gray-200 rounded-lg" />
                
                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-200" />
                  <Skeleton className="h-4 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 