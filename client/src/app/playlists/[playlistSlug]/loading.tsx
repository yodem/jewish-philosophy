import { GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function PlaylistLoading() {
  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Breadcrumbs skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-48 bg-gray-200" />
      </div>
      
      {/* Header section */}
      <div className="flex flex-col items-center mb-6 sm:mb-8 px-2 sm:px-4">
        <Skeleton className="h-8 w-3/4 bg-gray-200 mb-4" />
        
        {/* Description skeleton */}
        <div className="space-y-2 max-w-3xl w-full text-center">
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-3/4 mx-auto bg-gray-200" />
          <Skeleton className="h-4 w-2/3 mx-auto bg-gray-200" />
        </div>
      </div>
      
      {/* Playlist image skeleton */}
      <div className="mb-8 sm:mb-12 flex flex-col items-center px-2">
        <div className="w-full max-w-sm sm:max-w-md">
          <Skeleton className="w-full aspect-[3/4] bg-gray-200 rounded-lg" />
        </div>
      </div>
      
      {/* Videos section */}
      <div className="w-full flex flex-col items-center justify-center mt-8 sm:mt-16">
        <Skeleton className="h-6 w-32 bg-gray-200 mb-4" />
        <GridSkeleton count={6} />
      </div>
    </div>
  );
} 