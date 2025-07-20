// MediaCard.tsx
'use client';
import { Card } from './card';
import { Button } from './button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type MediaCardType = 'playlist' | 'video';

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
  // Only background color differs by type
  const bgColor = type === 'playlist'
    ? 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-950'
    : 'bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-gray-950';

  return (
    <Card
      className={cn(
        "flex flex-col items-center transition-shadow duration-200 cursor-pointer overflow-hidden",
        isLarge 
          ? "w-full h-auto aspect-video" 
          : "w-full sm:w-64 md:w-72 lg:w-80 min-h-[280px] sm:min-h-[320px] lg:min-h-[340px]",
        bgColor,
        "hover:shadow-xl",
        className
      )}
    >
      <div className="w-full relative">
        <Image
          src={image}
          alt={title}
          width={isLarge ? 1200 : 400}
          height={isLarge ? 900 : 300}
          className={cn(
            "object-contain rounded-t-lg w-full",
            isLarge ? "aspect-video" : "aspect-[4/3]"
          )}
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
        <Button className="mt-auto cursor-pointer w-full">{`צפייה ב${type === 'playlist' ? 'סדרה' : 'סרטון'}`}</Button>
      </div>
    </Card>
  );
} 