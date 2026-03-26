import Link from 'next/link';
import { StrapiImage } from '@/components/StrapiImage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Playlist } from '@/types';

interface PlaylistCardProps {
  playlist: Playlist;
  className?: string;
}

/**
 * Playlist card with thumbnail, play icon overlay, title, description, video count.
 * Purple badge accent per DESIGN.md (playlist = purple).
 */
export default function PlaylistCard({ playlist, className }: PlaylistCardProps) {
  const imageUrl = playlist.imageUrl300x400 || playlist.imageUrlStandard || '';
  const videoCount = playlist.videos?.length ?? 0;

  return (
    <Link href={`/playlists/${playlist.slug}`} className="no-underline h-full w-full flex items-center justify-center">
      <Card
        className={cn(
          'group flex flex-col w-full h-auto items-center transition-all duration-200 cursor-pointer overflow-hidden',
          'bg-card rounded-xl shadow-md border border-border/50 hover:shadow-lg',
          className
        )}
      >
        {/* Image with play icon overlay */}
        <div className="w-full overflow-hidden relative aspect-[4/3]">
          {imageUrl ? (
            <StrapiImage
              src={imageUrl}
              alt={playlist.title}
              fill
              quality={75}
              objectFit="contain"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">אין תמונה</span>
            </div>
          )}
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-purple-600 ms-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center p-6 w-full">
          <h3 className="font-bold mb-1 text-center text-lg line-clamp-2 text-foreground">
            {playlist.title}
          </h3>
          {videoCount > 0 && (
            <div className="text-xs text-muted-foreground text-center mb-1">
              מספר פרקים - {videoCount}
            </div>
          )}
          {playlist.description && (
            <p className="text-muted-foreground text-sm mb-4 text-justify line-clamp-2">
              {playlist.description}
            </p>
          )}
          <Button className="mt-auto cursor-pointer w-full">צפו בסדרה</Button>
        </div>
      </Card>
    </Link>
  );
}
