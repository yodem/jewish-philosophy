import { TableRowSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ResponsaListLoading() {
  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32 bg-muted" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-8 w-48 bg-muted mb-4" />
        <Skeleton className="h-4 w-96 bg-muted mb-6" />
        
        {/* Search form skeleton */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 flex-1 bg-muted" />
          <Skeleton className="h-10 w-16 bg-muted" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4">
                <Skeleton className="h-4 w-16 bg-muted" />
              </th>
              <th className="p-4">
                <Skeleton className="h-4 w-20 bg-muted" />
              </th>
              <th className="p-4">
                <Skeleton className="h-4 w-24 bg-muted" />
              </th>
              <th className="p-4">
                <Skeleton className="h-4 w-20 bg-muted" />
              </th>
            </tr>
          </thead>
          <tbody>
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center mt-6">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 bg-muted" />
          <Skeleton className="h-8 w-8 bg-muted" />
          <Skeleton className="h-8 w-8 bg-muted" />
        </div>
      </div>
      
      {/* Question form section skeleton */}
      <div className="mt-12">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-6 w-32 bg-muted" />
          <div className="bg-muted p-6 rounded-lg space-y-4">
            <Skeleton className="h-10 w-full bg-muted" />
            <Skeleton className="h-32 w-full bg-muted" />
            <Skeleton className="h-10 w-24 bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
} 