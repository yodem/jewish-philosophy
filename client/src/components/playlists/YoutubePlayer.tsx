"use client";

import React from "react";
import { YouTubeEmbed } from '@next/third-parties/google';
import { cn } from "@/lib/utils";

interface YoutubePlayerProps {
  videoId: string;
  title: string;
  className?: string;
  playlistTitle?: string;
}

/**
 * Responsive 16:9 YouTube iframe embed using @next/third-parties.
 */
export default function YoutubePlayer({
  videoId,
  title,
  className,
}: Readonly<YoutubePlayerProps>) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={cn(
          "w-full rounded-xl sm:rounded-2xl shadow-lg overflow-hidden relative",
          className
        )}
      >
        <YouTubeEmbed
          videoid={videoId}
          params="controls=1&rel=0&modestbranding=1"
          style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit; max-width: 100%; max-height: 100%;"
        />
      </div>
    </div>
  );
}
