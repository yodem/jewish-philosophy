'use client';
import React, { useState, useEffect } from 'react';
import PlaylistCard from './blocks/PlaylistCard';
import Link from 'next/link';
import type { Playlist } from '../types';

interface PlaylistsCarouselProps {
  playlists: Playlist[];
}

const getPerPage = (width: number) => {
  if (width < 640) return 1; // mobile
  if (width < 1600) return 2; // md
  return 3; // lg+
};

const PlaylistsCarousel: React.FC<PlaylistsCarouselProps> = ({ playlists }) => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  

  useEffect(() => {
    function handleResize() {
      setPerPage(getPerPage(window.innerWidth));
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [page]);

  const totalPages = Math.ceil(playlists.length / perPage);
  const visible = playlists.slice(page * perPage, page * perPage + perPage);

  useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [perPage, totalPages]);

  return (
    <>
      <div className="relative flex items-center justify-center mx-auto py-8 px-4">
        <button
          className="absolute cursor-pointer left-0 z-10 bg-white/80 hover:bg-white text-blue-700 rounded-full p-2 shadow-md disabled:opacity-40"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          aria-label="Previous"
          type="button"
        >
          &#8592;
        </button>
        <div className="flex flex-1 justify-center gap-6 md:gap-10 lg:gap-12 overflow-hidden">
          {visible.map((playlist) => (
            <Link key={playlist.id} href={`/playlists/${playlist.slug}`} className="no-underline">
              <PlaylistCard
                image={playlist.imageUrl300x400 || playlist.imageUrlStandard}
                title={playlist.title}
                description={playlist.description}
                cta="View Playlist"
                className="w-full h-full"
                episodeCount={playlist.videos ? playlist.videos.length : undefined}
              />
            </Link>
          ))}
        </div>
        <button
          className="absolute right-0 z-10 cursor-pointer bg-white/80 hover:bg-white text-blue-700 rounded-full p-2 shadow-md disabled:opacity-40"
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          aria-label="Next"
          type="button"
        >
          &#8594;
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${i === page ? 'bg-blue-600' : 'bg-gray-300'}`}
            onClick={() => setPage(i)}
            aria-label={`Go to page ${i + 1}`}
            type="button"
          />
        ))}
      </div>
    </>
  );
};

export default PlaylistsCarousel; 