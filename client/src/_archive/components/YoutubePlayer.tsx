"use client";

import React, { useEffect } from "react";
import { YouTubeEmbed } from '@next/third-parties/google';
import { cn } from "@/lib/utils";
import { trackVideoView, trackVideoPlay } from "@/lib/analytics";

interface YoutubePlayerProps {
  videoId: string;
  title: string;
  className?: string;
  playlistTitle?: string;
}

export default function YoutubePlayer({
  videoId,
  title,
  className,
  playlistTitle,
}: Readonly<YoutubePlayerProps>) {
  // Track video view when component mounts
  useEffect(() => {
    trackVideoView(videoId, title, playlistTitle);
  }, [videoId, title, playlistTitle]);

  // Track video play when user interacts with the player
  const handleVideoInteraction = () => {
    trackVideoPlay(videoId, title, playlistTitle);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
    
      <div 
        className={cn("w-full  rounded-xl sm:rounded-2xl shadow-lg overflow-hidden relative", className)}
        onClick={handleVideoInteraction}
      
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