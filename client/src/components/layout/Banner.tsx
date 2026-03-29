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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-1 leading-tight">
            {banner.title}
          </h2>
          <p className="text-primary-foreground/80 text-sm leading-relaxed">
            {banner.description}
          </p>
        </div>

        {(formattedDate || banner.link) && (
          <div className="flex items-center justify-between sm:justify-end sm:gap-4 shrink-0">
            {formattedDate && (
              <div className="flex items-center gap-1.5 text-primary-foreground/80">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                  {formattedDate}
                </span>
              </div>
            )}
            {banner.link && (
              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground/70 shrink-0" />
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-r from-navbar to-accent border-b border-accent/40 shadow-sm">
      {banner.link ? (
        <Link
          href={banner.link}
          className={cn(
            "block py-3 sm:py-4 hover:bg-accent/20 transition-colors"
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
