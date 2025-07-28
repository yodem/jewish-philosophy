'use client';

import Link from "next/link";
import React from "react";
import { generateBreadcrumbStructuredData } from "@/lib/metadata";
import { trackBreadcrumbClick } from "@/lib/analytics";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/';
  
  // Generate structured data for breadcrumbs
  const breadcrumbData = generateBreadcrumbStructuredData(
    items
      .filter(item => item.href) // Only include items with href
      .map(item => ({
        name: item.label,
        url: item.href!.startsWith('http') ? item.href! : `${baseUrl}${item.href!}`
      }))
  );

  return (
    <>
      {/* Structured data for breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      
      <nav 
        className="text-xs sm:text-sm mb-4 sm:mb-6 w-full overflow-x-auto pb-2" 
        aria-label="ניווט Breadcrumb - נתיב הדף הנוכחי"
        role="navigation"
      >
        <ol 
          className="list-none p-0 inline-flex whitespace-nowrap" 
          itemScope 
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, idx) => (
            <li 
              key={item.label} 
              className="flex items-center"
              itemScope
              itemType="https://schema.org/ListItem"
              itemProp="itemListElement"
            >
              <meta itemProp="position" content={(idx + 1).toString()} />
              
              {item.href ? (
                <Link 
                  href={item.href} 
                  className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200"
                  itemProp="item"
                  title={`עבור ל${item.label}`}
                  onClick={() => trackBreadcrumbClick(item.label, item.href!)}
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span 
                  className="text-gray-500 font-medium" 
                  itemProp="name"
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