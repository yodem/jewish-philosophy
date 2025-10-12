'use client';

import React from 'react';
import Link from 'next/link';
import type { Banner } from '@/types';
import { Calendar, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerProps {
  banner: Banner;
}

const Banner: React.FC<BannerProps> = ({ banner }) => {
  if (!banner.isActive) {
    return null;
  }

  const formattedDate = banner.date 
    ? new Date(banner.date).toLocaleString('he-IL', {
        timeZone: 'Asia/Jerusalem',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const BannerContent = () => (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      {/* Mobile-first: Stack content vertically, then horizontal on larger screens */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        
        {/* Main content - Full width on mobile */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-1 leading-tight">
            {banner.title}
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            {banner.description}
          </p>
        </div>

        {/* Date and link row - Horizontal on mobile, same line on desktop */}
        <div className="flex items-center justify-between sm:justify-end sm:gap-4 shrink-0">
          {/* Date indicator */}
          {formattedDate && (
            <div className="flex items-center gap-1.5 text-blue-100">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {formattedDate}
              </span>
            </div>
          )}
          
          {/* External link indicator */}
          {banner.link && (
            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200 shrink-0" />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-r from-blue-700 to-blue-800 border-b border-blue-600 shadow-sm">
      {banner.link ? (
        <Link 
          href={banner.link}
          className={cn(
            "block py-3 sm:py-4 hover:bg-blue-600/20 transition-colors",
            banner.link.startsWith('http') ? '' : ''
          )}
          {...(banner.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <BannerContent />
        </Link>
      ) : (
        <div className="py-3 sm:py-4">
          <BannerContent />
        </div>
      )}
    </div>
  );
};

export default Banner;
