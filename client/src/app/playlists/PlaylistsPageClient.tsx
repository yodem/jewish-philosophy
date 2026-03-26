"use client";

import dynamic from "next/dynamic";
import type { Playlist } from "@/types";

interface PlaylistsPageClientProps {
  playlists: Playlist[];
}

function PlaylistGridSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
            <div className="h-48 bg-muted animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded-lg animate-pulse mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PlaylistGrid = dynamic(() => import("@/components/playlists/PlaylistGrid"), {
  loading: () => <PlaylistGridSkeleton />
});

export default function PlaylistsPageClient({ playlists }: PlaylistsPageClientProps) {
  if (playlists.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <PlaylistGrid
        initialPlaylists={playlists}
        baseUrl="/playlists"
      />
    </div>
  );
}
