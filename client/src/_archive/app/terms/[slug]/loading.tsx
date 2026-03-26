import { Skeleton } from '@/components/ui/skeleton';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function TermLoadingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "בית", href: "/" },
          { label: "מושגים", href: "/terms" },
          { label: "..." }
        ]}
      />
      
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4 bg-muted" />
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <Skeleton className="h-5 w-24 bg-muted" />
            <Skeleton className="h-5 w-28 bg-muted" />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Skeleton className="h-6 w-16 bg-muted rounded-full" />
            <Skeleton className="h-6 w-20 bg-muted rounded-full" />
            <Skeleton className="h-6 w-18 bg-muted rounded-full" />
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-right mx-auto">
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/30 rounded-xl p-8 shadow-sm border">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full bg-muted" />
              <Skeleton className="h-6 w-5/6 bg-muted" />
              <Skeleton className="h-6 w-4/5 bg-muted" />
              <Skeleton className="h-6 w-full bg-muted" />
              <Skeleton className="h-6 w-3/4 bg-muted" />
              <Skeleton className="h-6 w-5/6 bg-muted" />
              <Skeleton className="h-6 w-2/3 bg-muted" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border dark:border-gray-700">
          <div className="text-center">
            <Skeleton className="h-4 w-32 mx-auto bg-muted" />
          </div>
        </footer>
      </article>
    </div>
  );
}
