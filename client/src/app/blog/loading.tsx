import { CardSkeleton, GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32 bg-muted" />
      </div>

      {/* Featured blog skeleton */}
      <div className="mb-16">
        <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border grid md:grid-cols-2">
          <div className="h-64 md:h-full min-h-[400px] bg-muted animate-pulse" />
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Blog grid skeleton */}
      <GridSkeleton count={6} />
    </div>
  );
}
