'use client';

import Link from 'next/link';
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { trackBreadcrumbClick } from '@/lib/analytics';
import { JsonLd } from '@/lib/json-ld';
import { cn } from '@/lib/utils';
import type { WithContext, BreadcrumbList } from 'schema-dts';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Use "onDark" when rendered over a dark hero / navbar-coloured section */
  variant?: 'default' | 'onDark';
}

export default function Breadcrumbs({
  items,
  className,
  variant = 'default',
}: BreadcrumbsProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/';

  const breadcrumbData: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem' as const,
      position: idx + 1,
      name: item.label,
      ...(item.href && {
        item: item.href.startsWith('http')
          ? item.href
          : `${baseUrl}${item.href}`,
      }),
    })),
  };

  const onDark = variant === 'onDark';

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <nav
        className={cn('mb-6 w-full', className)}
        aria-label="ניווט נתיב הדף"
      >
        <ol className="flex items-center gap-1.5 text-sm">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <li
                key={idx}
                className={cn(
                  'flex items-center gap-1.5',
                  isLast && 'min-w-0'
                )}
              >
                {idx > 0 && (
                  <ChevronLeft
                    className={cn(
                      'size-3.5 shrink-0',
                      onDark ? 'text-white/30' : 'text-muted-foreground/40'
                    )}
                    aria-hidden="true"
                  />
                )}

                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'shrink-0 transition-colors',
                      onDark
                        ? 'text-white/60 hover:text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() =>
                      trackBreadcrumbClick(item.label, item.href!)
                    }
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'truncate',
                      onDark
                        ? 'text-white/80'
                        : 'text-muted-foreground'
                    )}
                    aria-current="page"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
