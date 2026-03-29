import { GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function PlaylistsLoading() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
      {/* Hero skeleton */}
      <div className="w-full bg-muted py-16 md:py-24 px-4 text-center">
        <div className="container mx-auto space-y-4">
          <Skeleton className="h-4 w-24 bg-muted-foreground/10 mx-auto" />
          <Skeleton className="h-10 w-48 bg-muted-foreground/10 mx-auto" />
          <Skeleton className="h-4 w-96 bg-muted-foreground/10 mx-auto" />
          <Skeleton className="h-4 w-80 bg-muted-foreground/10 mx-auto" />
        </div>
      </div>

      {/* Playlist grid skeleton */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <GridSkeleton count={6} />
      </div>
    </div>
  );
}
