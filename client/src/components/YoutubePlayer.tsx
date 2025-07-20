"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface YoutubePlayerProps {
  videoId: string;
  title: string;
  className?: string;
}

export default function YoutubePlayer({
  videoId,
  title,
  className,
}: Readonly<YoutubePlayerProps>) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800 text-center sm:text-right">
        {title}
      </h2>
      <div className={cn("aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg", className)}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          loading="lazy"
        />
      </div>
    </div>
  );
} 