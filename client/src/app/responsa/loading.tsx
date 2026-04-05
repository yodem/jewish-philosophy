import { Skeleton } from "@/components/ui/skeleton";

export default function ResponsaListLoading() {
  return (
    <div className="flex flex-col">
      {/* Header skeleton */}
      <section className="bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 pb-8">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
            <div className="flex-1">
              <Skeleton className="h-10 w-56 mb-2" />
              <Skeleton className="h-5 w-full max-w-lg" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </section>

      {/* Table skeleton */}
      <section className="max-w-6xl mx-auto px-4 pb-8 w-full">
        <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-muted border-b border-border">
            <div className="col-span-6"><Skeleton className="h-4 w-16" /></div>
            <div className="col-span-3"><Skeleton className="h-4 w-20" /></div>
            <div className="col-span-1 flex justify-center"><Skeleton className="h-4 w-12" /></div>
            <div className="col-span-1 flex justify-center"><Skeleton className="h-4 w-12" /></div>
            <div className="col-span-1 flex justify-end"><Skeleton className="h-4 w-12" /></div>
          </div>
          {/* Rows */}
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-8 py-6 items-center">
                <div className="col-span-6">
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="col-span-3 flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Skeleton className="h-5 w-8" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Skeleton className="h-5 w-8" />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
