'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export const useAnalytics = () => {
  const pathname = usePathname();

  // Automatically track page views
  useEffect(() => {
    if (pathname) {
      const pageTitle = document.title || 'Jewish Philosophy';
      trackPageView(pathname, pageTitle);
    }
  }, [pathname]);

  return {
    trackPageView,
  };
}; 