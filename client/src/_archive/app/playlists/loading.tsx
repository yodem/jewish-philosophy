import { GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function PlaylistsLoading() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
      {/* Page header skeleton */}
      <div className="mb-8 space-y-4 text-center">
        <Skeleton className="h-8 w-48 bg-muted mx-auto" />
        <Skeleton className="h-4 w-96 bg-muted mx-auto" />
        <Skeleton className="h-4 w-80 bg-muted mx-auto" />
      </div>
      
      {/* Playlists section */}
      <div className="w-full flex flex-col items-center justify-center mt-8 sm:mt-16">
        <Skeleton className="h-6 w-24 bg-muted mb-4" />
        <GridSkeleton count={6} />
      </div>
    </div>
  );
} 