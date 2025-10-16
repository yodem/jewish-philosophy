'use client';

import { useEffect } from 'react';
import { fetchAPI } from '@/utils/fetchApi';

interface ViewCountTrackerProps {
  contentType: 'blogs' | 'videos' | 'responsas' | 'writings' | 'terms';
  contentId: string;
}

export default function ViewCountTracker({ 
  contentType, 
  contentId
}: ViewCountTrackerProps) {
  useEffect(() => {
    const updateViewCount = async (itemId: string) => {
      const viewedKey = `viewed_${contentType}_${itemId}`;

      // Check if the view has already been counted in this session
      if (sessionStorage.getItem(viewedKey)) {
        return;
      }

      // Set the viewed flag immediately to prevent race conditions
      sessionStorage.setItem(viewedKey, "true");

      try {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || 'http://localhost:1337';
        const apiUrl = `${baseUrl}/api/${contentType}/${itemId}/view`;
        
        await fetchAPI(apiUrl, {
          method: "POST",
        });
      } catch (error) {
        console.error(`Failed to update view count:`, error);
        // Remove the flag if the API call failed so it can be retried
        sessionStorage.removeItem(viewedKey);
      }
    };

    // Call this function when the content is loaded
    updateViewCount(contentId);
  }, [contentType, contentId]);

  // This component doesn't render anything
  return null;
}
