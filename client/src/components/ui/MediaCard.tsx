// MediaCard.tsx
'use client';
import { Card } from './card';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { StrapiImage } from '../StrapiImage';

export type MediaCardType = 'playlist' | 'video' | 'blog' | 'book' | 'article';

export interface MediaCardProps {
  image: string;
  title: string;
  description?: string;
  episodeCount?: number;
  className?: string;
  type: MediaCardType;
  isLarge?: boolean;
}

export default function MediaCard({
  image,
  title,
  description,
  episodeCount,
  className,
  type,
  isLarge = false,
}: MediaCardProps) {
  // Dicts for background color and button text by type
  const bgColorMap: Record<MediaCardType, string> = {
    playlist: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-950',
    video: 'bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-gray-950',
    blog: 'bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-gray-950',
    book: 'bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-950',
    article: 'bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/30 dark:to-gray-950',
  };
  const buttonTextMap: Record<MediaCardType, string> = {
    playlist: 'צפייה בסדרה',
    video: 'צפייה בסרטון',
    blog: 'קרא עוד',
    book: 'צפייה בספר',
    article: 'קרא מאמר',
  };

  return (
    <Card
      className={cn(
        "flex flex-col w-full h-auto items-center transition-shadow duration-200 cursor-pointer overflow-hidden",
        bgColorMap[type],
        "hover:shadow-xl",
        className
      )}
    >
      <div className="w-full ">
        <StrapiImage
          src={image}
          alt={title}
          width={isLarge ? 1200 : 400}
          height={isLarge ? 900 : 300}
          quality={isLarge ? 100 : 50}
          className={cn(
            "object-contain rounded-lg w-full h-full")}
          priority
        />
      </div>
      <div className="flex flex-col items-center p-4 w-full">
        <h3 className="font-bold mb-1 text-center text-lg line-clamp-2">{title}</h3>
        {typeof episodeCount === 'number' && (
          <div className="text-xs text-gray-500 text-center mb-1">מספר פרקים - {episodeCount}</div>
        )}
        {description && (
          <p className="text-gray-600 text-sm mb-4 text-center line-clamp-2">{description}</p>
        )}
        <Button className="mt-auto cursor-pointer w-full">{buttonTextMap[type]}</Button>
      </div>
    </Card>
  );
} 