import { Skeleton } from "@/components/ui/skeleton";

export default function HomeContentGridSkeleton() {
  return (
    <section className="py-8 md:py-12" aria-label="טוען תוכן...">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-muted/30 p-6"
          >
            {/* Icon + Title */}
            <div className="mb-6 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-6 w-32" />
            </div>

            {/* Content lines */}
            <div className="mb-8 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* CTA link */}
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </section>
  );
}
