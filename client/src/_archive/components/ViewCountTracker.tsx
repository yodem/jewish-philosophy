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
      try {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || 'https://gorgeous-power-cb8382b5a9.strapiapp.com';
        const apiUrl = `${baseUrl}/api/${contentType}/${itemId}/view`;
        
        await fetchAPI(apiUrl, {
          method: "POST",
        });
      
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

    // Call this function when the content is loaded
    updateViewCount(contentId);
  }, [contentType, contentId]);

  // This component doesn't render anything
  return null;
}
