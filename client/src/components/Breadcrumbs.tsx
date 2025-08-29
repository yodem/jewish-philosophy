'use client';

import Link from 'next/link';
import React from 'react';
import { trackBreadcrumbClick } from '@/lib/analytics';
import { JsonLd } from '@/lib/json-ld';
import { WithContext, BreadcrumbList } from 'schema-dts';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/';

  const breadcrumbData: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      ...(item.href && { item: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}` }),
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <nav
        className="text-xs sm:text-sm mb-4 sm:mb-6 w-full overflow-x-auto pb-2"
        aria-label="ניווט Breadcrumb - נתיב הדף הנוכחי"
        role="navigation"
      >
        <ol className="list-none p-0 inline-flex whitespace-nowrap">
          {items.map((item, idx) => (
            <li key={item.label} className="flex items-center">
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200"
                  title={`עברו ל${item.label}`}
                  onClick={() => trackBreadcrumbClick(item.label, item.href!)}
                >
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className="text-gray-500 font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}

              {idx < items.length - 1 && (
                <span
                  className="mx-1 sm:mx-2 text-gray-400"
                  aria-hidden="true"
                  role="separator"
                >
                  /
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
} 