'use client';

import { useEffect } from 'react';
import { trackContentView, trackWritingRead } from '@/lib/analytics';

interface WritingTrackerProps {
  writingTitle: string;
  writingType: string;
  author: string;
}

interface WritingButtonTrackerProps {
  writingTitle: string;
  writingType: string;
  author: string;
  isExternal: boolean;
  children: React.ReactNode;
}

export function WritingViewTracker({ writingTitle, writingType, author }: WritingTrackerProps) {
  useEffect(() => {
    trackContentView(writingTitle, writingType, author);
  }, [writingTitle, writingType, author]);

  return null; // This component doesn't render anything
}

export function WritingButtonTracker({ 
  writingTitle, 
  writingType, 
  author, 
  isExternal, 
  children
}: WritingButtonTrackerProps) {
  const handleClick = () => {
    trackWritingRead(writingTitle, writingType, author, isExternal);
  };

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
} 