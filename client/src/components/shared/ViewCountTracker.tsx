'use client';

import { useEffect } from 'react';
import { trackViewAction } from '@/data/action';

interface ViewCountTrackerProps {
  contentType: 'blogs' | 'videos' | 'responsas' | 'writings' | 'terms';
  contentId: string;
}

export default function ViewCountTracker({
  contentType,
  contentId
}: ViewCountTrackerProps) {
  useEffect(() => {
    trackViewAction(contentType, contentId);
  }, [contentType, contentId]);

  return null;
}
