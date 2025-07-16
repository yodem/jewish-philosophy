'use client';
import React from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Image from 'next/image';

interface PlaylistCardProps {
  image: string;
  title: string;
  description: string;
  cta: string;
  className?: string;
  episodeCount?: number;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ image, title, description, cta, className, episodeCount }) => {
  return (
    <Card className={`w-120 min-h-[340px] lg:w-108 lg:min-h-[380px] hover:shadow-xl transition-shadow duration-200 cursor-pointer ${className || ''}`}>
      <Image
        src={image}
        alt={title}
        width={400}
        height={300}
        className="w-full h-48 lg:h-56 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-bold mb-1 text-center">{title}</h3>
      {typeof episodeCount === 'number' && (
        <div className="text-xs text-gray-500 text-center mb-1">{episodeCount} episode{episodeCount !== 1 ? 's' : ''}</div>
      )}
      <p className="text-gray-600 text-sm mb-4 text-center min-h-[48px]">{description}</p>
      <Button as="button" className="mt-auto cursor-pointer">{cta}</Button>
    </Card>
  );
};

export default PlaylistCard; 