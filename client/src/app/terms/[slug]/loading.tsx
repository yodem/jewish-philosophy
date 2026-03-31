import { Skeleton } from '@/components/ui/skeleton';

export default function TermLoadingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <Skeleton className="h-4 w-48 mb-4" />

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-right mx-auto">
          <div className="bg-gradient-to-br from-card to-accent/10 rounded-xl p-4 sm:p-8 shadow-sm border border-border">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
