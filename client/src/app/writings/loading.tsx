import { Skeleton } from "@/components/ui/skeleton";

export default function WritingsLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero skeleton */}
      <section className="bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
            <div className="flex-1">
              <Skeleton className="h-12 w-64 mb-2" />
              <Skeleton className="h-5 w-full max-w-xl" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </section>

      {/* Table skeleton */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 w-full">
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Toolbar skeleton */}
          <div className="p-6 border-b border-border bg-muted/50 flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
              <Skeleton className="h-10 flex-1 lg:w-72" />
              <Skeleton className="h-10 w-44" />
            </div>
          </div>

          {/* Table header skeleton */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted border-b border-border">
            <div className="col-span-5"><Skeleton className="h-4 w-20" /></div>
            <div className="col-span-2"><Skeleton className="h-4 w-12" /></div>
            <div className="col-span-3"><Skeleton className="h-4 w-16" /></div>
            <div className="col-span-2 flex justify-center"><Skeleton className="h-4 w-12" /></div>
          </div>

          {/* Table rows skeleton */}
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center">
                <div className="col-span-5 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-3 flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
