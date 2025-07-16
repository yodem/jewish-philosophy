'use client';
import React from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';

interface PlaylistCardProps {
  image: string;
  title: string;
  description: string;
  cta: string;
  className?: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ image, title, description, cta, className }) => {
  return (
    <Card className={`w-72 min-h-[340px] hover:shadow-xl transition-shadow duration-200 cursor-pointer ${className || ''}`}>
      <img
        src={image}
        alt={title}
        className="w-60 h-40 object-cover rounded-lg mb-4"
      />
      <h3 className="text-lg font-bold mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 text-center min-h-[48px]">{description}</p>
      <Button as="button" className="mt-auto">{cta}</Button>
    </Card>
  );
};

export default PlaylistCard; 