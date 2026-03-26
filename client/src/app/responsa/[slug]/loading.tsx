import { ContentSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ResponsaLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Breadcrumbs skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="bg-muted p-6 rounded-lg mb-12">
          <ContentSkeleton />
        </div>

        {/* Comments section skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          </div>

          {/* Comment form skeleton */}
          <div className="mt-12 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="bg-muted p-6 rounded-lg space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
