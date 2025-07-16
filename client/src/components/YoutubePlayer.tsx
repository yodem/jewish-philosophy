"use client";

import Box from '@mui/material/Box';

export default function YoutubePlayer({ videoId, title }: { videoId: string, title: string }) {
  return (
    <Box width="100%" height={0} pb="56.25%" position="relative">
      <Box component="iframe"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
      />
    </Box>
  );
} 