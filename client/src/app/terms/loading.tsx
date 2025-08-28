import Breadcrumbs from "@/components/Breadcrumbs";
import { GridSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function TermsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs items={[
        { label: 'בית', href: '/' },
        { label: 'מושגים' }
      ]} />

      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-4" />
        <Skeleton className="h-5 w-96 mb-6" />
        
        {/* Search form skeleton */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>

      <GridSkeleton count={12} />
    </div>
  );
}
