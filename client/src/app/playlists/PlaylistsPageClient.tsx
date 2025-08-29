"use client";

import dynamic from "next/dynamic";
import type { Playlist } from "@/types";

interface PlaylistsPageClientProps {
  playlists: Playlist[];
}

// Dynamic import for PlaylistGrid component
const PlaylistGrid = dynamic(() => import("@/components/PlaylistGrid"), {
  loading: () => (
    <div className="w-full flex flex-col items-center mt-8 sm:mt-16">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  )
});

export default function PlaylistsPageClient({ playlists }: PlaylistsPageClientProps) {
  if (playlists.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center mt-8 sm:mt-16">
      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">סדרות</h3>
      <PlaylistGrid
        initialPlaylists={playlists}
        baseUrl="/playlists"
      />
    </div>
  );
}
