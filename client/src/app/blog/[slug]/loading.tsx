import { ContentSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Breadcrumbs skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-40 bg-gray-200" />
      </div>
      
      {/* Header section */}
      <div className="flex flex-col items-center mb-6 sm:mb-8 px-2 sm:px-4">
        <Skeleton className="h-8 w-3/4 bg-gray-200 mb-2" />
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-20 bg-gray-200" />
          <Skeleton className="h-4 w-20 bg-gray-200" />
        </div>
        
        {/* Categories skeleton */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <Skeleton className="h-6 w-16 bg-gray-200 rounded-full" />
          <Skeleton className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2 max-w-3xl w-full text-center">
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-3/4 mx-auto bg-gray-200" />
        </div>
      </div>
      
      {/* Cover image skeleton */}
      <div className="mb-8 sm:mb-12 flex flex-col items-center px-2">
        <div className="w-full max-w-md sm:max-w-3xl">
          <Skeleton className="w-full aspect-video bg-gray-200 rounded-lg" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="max-w-3xl mx-auto px-4 mt-8 mb-12">
        <ContentSkeleton />
      </div>
      
      {/* Question form section skeleton */}
      <div className="mt-10 border-t pt-8 mx-auto w-full max-w-xl sm:max-w-2xl px-2 sm:px-4">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 bg-gray-200" />
          <Skeleton className="h-32 w-full bg-gray-200 rounded-lg" />
          <Skeleton className="h-10 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
} 