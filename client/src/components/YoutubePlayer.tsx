"use client";

import React from "react";

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
  console.log(videoId);
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {title}
      </h2>
      <div className={`aspect-video overflow-hidden rounded-2xl shadow-lg ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
} 