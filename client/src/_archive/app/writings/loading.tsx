import { Skeleton } from "@/components/ui/skeleton";

export default function WritingsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32 bg-muted" />
      </div>
      
      {/* Page header skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-4 w-96 bg-muted" />
      </div>
      
      {/* Writings grid */}
      <div className="w-full">
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <Skeleton className="h-6 w-32 bg-muted mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                {/* Chip */}
                <Skeleton className="h-6 w-20 bg-muted" />
                
                {/* Large log text */}
                <Skeleton className="h-8 w-full bg-muted" />
                
                {/* Two texts separated by dot */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24 bg-muted" />
                  <Skeleton className="h-2 w-2 bg-muted rounded-full" />
                  <Skeleton className="h-4 w-20 bg-muted" />
                </div>
                
                {/* Big image */}
                <Skeleton className="h-48 w-full bg-muted rounded-lg" />
                
                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 