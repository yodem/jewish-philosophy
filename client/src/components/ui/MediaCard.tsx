// MediaCard.tsx
'use client';
import React from 'react';
import { Card } from './card';
import { Button } from './button';
import Image from 'next/image';

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

const MediaCard: React.FC<MediaCardProps> = ({
  image,
  title,
  description,
  episodeCount,
  className,
  type,
  isLarge = false,
}) => {
  // Only background color differs by type
  const bgColor = type === 'playlist'
    ? 'bg-gradient-to-br from-blue-50 to-white'
    : 'bg-gradient-to-br from-orange-50 to-white';

  return (
    <Card
      className={`flex flex-col items-center ${isLarge ? "w-120 h-90" : "w-80 min-h-[340px] lg:w-96 lg:min-h-[380px]"} ${bgColor} hover:shadow-xl transition-shadow duration-200 cursor-pointer ${className || ''}`}
    >
      <Image
        src={image}
        alt={title}
        width={isLarge ? 1200:400}
        height={isLarge ? 900:300}
        className={`object-contain rounded-lg mb-4 w-full ${isLarge ? "h-90 w-120" : "h-48 w-56"}`}
      />
      <h3 className="font-bold mb-1 text-center text-lg max-w-[90%]">{title}</h3>
      {typeof episodeCount === 'number' && (
        <div className="text-xs text-gray-500 text-center mb-1">מספר פרקים - {episodeCount} </div>
      )}
      {description && (
        <p className="text-gray-600 text-sm mb-4 text-center min-h-[48px]">{description}</p>
      )}
      <Button className="mt-auto cursor-pointer w-full max-w-[90%]">{`צפייה ב${type === 'playlist' ? 'סדרה' : 'סרטון'}`}</Button>
    </Card>
  );
};

export default MediaCard; 