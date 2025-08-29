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
          <Skeleton className="h-12 w-3/4 mx-auto mb-4 bg-gray-200" />
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <Skeleton className="h-5 w-24 bg-gray-200" />
            <Skeleton className="h-5 w-28 bg-gray-200" />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Skeleton className="h-6 w-16 bg-gray-200 rounded-full" />
            <Skeleton className="h-6 w-20 bg-gray-200 rounded-full" />
            <Skeleton className="h-6 w-18 bg-gray-200 rounded-full" />
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-right mx-auto">
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/30 rounded-xl p-8 shadow-sm border">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full bg-gray-200" />
              <Skeleton className="h-6 w-5/6 bg-gray-200" />
              <Skeleton className="h-6 w-4/5 bg-gray-200" />
              <Skeleton className="h-6 w-full bg-gray-200" />
              <Skeleton className="h-6 w-3/4 bg-gray-200" />
              <Skeleton className="h-6 w-5/6 bg-gray-200" />
              <Skeleton className="h-6 w-2/3 bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <Skeleton className="h-4 w-32 mx-auto bg-gray-200" />
          </div>
        </footer>
      </article>
    </div>
  );
}
