import { Skeleton } from "@/components/ui/skeleton";

export default function WritingsLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero skeleton */}
      <section className="bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
            <div>
              <Skeleton className="h-12 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </section>

      {/* Table skeleton */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 w-full">
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/50 flex flex-col lg:flex-row gap-6 items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-80" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
