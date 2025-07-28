'use client';

import { useEffect } from 'react';
import { trackPlaylistView } from '@/lib/analytics';

interface PlaylistViewTrackerProps {
  playlistTitle: string;
  videoCount: number;
}

export default function PlaylistViewTracker({ playlistTitle, videoCount }: PlaylistViewTrackerProps) {
  useEffect(() => {
    trackPlaylistView(playlistTitle, videoCount);
  }, [playlistTitle, videoCount]);

  return null; // This component doesn't render anything
} 