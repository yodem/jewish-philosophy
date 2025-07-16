'use client';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useState } from 'react';
import VideoCard from './blocks/VideoCard';
import Link from 'next/link';

export default function VideosCarousel({ videos, playlistSlug }: { videos: any[], playlistSlug: string }) {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(videos.length / perPage);
  const visible = videos.slice(page * perPage, page * perPage + perPage);

  return (
    <Box position="relative" display="flex" alignItems="center" justifyContent="center" mx="auto" py={4} px={2}>
      <IconButton
        sx={{ position: 'absolute', left: 0, zIndex: 10, bgcolor: 'background.paper', color: 'primary.main', opacity: page === 0 ? 0.4 : 1 }}
        onClick={() => setPage(Math.max(0, page - 1))}
        disabled={page === 0}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <Box display="flex" flex={1} justifyContent="center" gap={3} overflow="hidden">
        {visible.map((video) => (
          <Link key={video.id} href={`/playlists/${playlistSlug}/${video.slug}`} passHref legacyBehavior>
            <a style={{ textDecoration: 'none' }}>
              <VideoCard
                image={video.imageUrl300x400 || video.imageUrlStandard}
                title={video.title}
                cta="Watch Video"
              />
            </a>
          </Link>
        ))}
      </Box>
      <IconButton
        sx={{ position: 'absolute', right: 0, zIndex: 10, bgcolor: 'background.paper', color: 'primary.main', opacity: page >= totalPages - 1 ? 0.4 : 1 }}
        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
      >
        <ArrowForwardIosIcon />
      </IconButton>
      <Box display="flex" justifyContent="center" gap={1} mt={2} position="absolute" bottom={-32} left={0} right={0}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <IconButton
            key={i}
            size="small"
            sx={{ bgcolor: i === page ? 'primary.main' : 'grey.300', color: i === page ? 'common.white' : 'grey.700' }}
            onClick={() => setPage(i)}
          />
        ))}
      </Box>
    </Box>
  );
} 