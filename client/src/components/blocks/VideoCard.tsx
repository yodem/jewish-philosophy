'use client';
import React from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';

interface VideoCardProps {
  image: string;
  title: string;
  cta: string;
  className?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ image, title, cta, className }) => {
  return (
    <Card className={`w-60 min-h-[220px] hover:shadow-xl transition-shadow duration-200 cursor-pointer ${className || ''}`}>
      <img
        src={image}
        alt={title}
        className="w-52 h-32 object-cover rounded-lg mb-3"
      />
      <h4 className="text-base font-semibold mb-2 text-center">{title}</h4>
      <Button as="button" className="mt-auto">{cta}</Button>
    </Card>
  );
};

export default VideoCard; 