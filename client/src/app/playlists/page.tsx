import React from 'react';
import PlaylistCard from '../../components/blocks/PlaylistCard';
import Link from 'next/link';

async function getPlaylists() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/playlists`, { cache: 'no-store' });
  const data = await res.json();
  return data.data || [];
}

export default async function PlaylistsPage() {
  const playlists = await getPlaylists();
  
  return (
    <div className="flex flex-wrap gap-8 justify-center py-8 px-2">
      {playlists.map((playlist: any) => (
        <Link key={playlist.id} href={`/playlists/${playlist.slug}`} className="no-underline">
          <PlaylistCard
            image={playlist.imageUrl300x400 || playlist.imageUrlStandard}
            title={playlist.title}
            description={playlist.description}
            cta="View Playlist"
          />
        </Link>
      ))}
    </div>
  );
} 