import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="text-xs sm:text-sm mb-4 sm:mb-6 w-full overflow-x-auto pb-2" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex whitespace-nowrap">
        {items.map((item, idx) => (
          <li key={item.label} className="flex items-center">
            {item.href ? (
              <Link href={item.href} className="text-blue-600 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500 font-medium">{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 