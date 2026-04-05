'use client';

import Link from 'next/link';
import { StrapiImage } from '@/components/shared/StrapiImage';
import { cn } from '@/lib/utils';
import type { Blog } from '@/types';
import { formatDate } from '@/lib/date-utils';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { getStrapiMediaEntryUrl } from '@/lib/strapi-media';
import { Eye } from 'lucide-react';

interface BlogCardProps {
  blog: Blog;
  className?: string;
}

/**
 * Blog card with image, category pills, title, author, date, excerpt, CTA.
 * Green badge accent per DESIGN.md (blog = green).
 */
export default function BlogCard({ blog, className }: BlogCardProps) {
  const imageUrl = getStrapiMediaEntryUrl(blog.coverImage);
  const authorName = blog.author?.name || 'המערכת';

  return (
    <article
      className={cn(
        'bg-card rounded-lg overflow-hidden shadow-sm border border-border flex flex-col',
        'hover:shadow-md transition-shadow group',
        className
      )}
    >
      {/* Image with hover zoom */}
      <Link href={`/blog/${blog.slug}`} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative h-48 w-full bg-muted">
          {imageUrl ? (
            <StrapiImage
              src={imageUrl}
              alt={blog.title}
              fill
              quality={75}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              objectFit="cover"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">אין תמונה</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Category pills */}
        {blog.categories && blog.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {blog.categories.slice(0, 3).map((category) => (
              <CategoryBadge key={category.id} category={category} isSelectable={false} />
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${blog.slug}`} tabIndex={-1} aria-hidden="true">
          <h3 className="text-xl font-bold text-foreground mb-2 leading-snug line-clamp-2 hover:text-accent transition-colors">
            {blog.title}
          </h3>
        </Link>

        {/* Author + Date + Views */}
        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-2 flex-wrap">
          <span>{authorName} &bull; {formatDate(blog.publishedAt)}</span>
          {blog.views != null && blog.views > 0 && (
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3" />
              {blog.views.toLocaleString('he-IL')}
            </span>
          )}
        </div>

        {/* Description */}
        {blog.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed text-right w-full">
            {blog.description}
          </p>
        )}

        {/* Read more link */}
        <Link
          href={`/blog/${blog.slug}`}
          className="text-accent font-bold text-sm inline-flex items-center mt-auto pt-4 gap-1 transition-all duration-200 hover:gap-2 hover:opacity-80"
        >
          המשיכו לקרוא
          <svg
            className="w-4 h-4 ms-1"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

