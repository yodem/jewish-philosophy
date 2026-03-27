import { TermsGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function TermsLoading() {
  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      {/* Hero skeleton */}
      <section className="w-full bg-gradient-to-br from-navbar to-navbar/80 py-16 md:py-24 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-4 w-32 mx-auto mb-6 bg-primary-foreground/20" />
          <Skeleton className="h-12 w-80 mx-auto mb-4 bg-primary-foreground/20" />
          <Skeleton className="h-5 w-96 mx-auto bg-primary-foreground/20" />
        </div>
      </section>

      {/* Content skeleton */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-16" />
          </div>
          <TermsGridSkeleton count={12} />
        </div>
      </div>
    </div>
  );
}
