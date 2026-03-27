'use client';

import Link from 'next/link';
import { StrapiImage } from '@/components/shared/StrapiImage';
import { cn } from '@/lib/utils';
import type { Blog } from '@/types';
import { formatDate } from '@/lib/date-utils';
import { CategoryBadge } from '@/components/shared/CategoryBadge';

interface BlogCardProps {
  blog: Blog;
  className?: string;
}

/**
 * Blog card with image, category pills, title, author, date, excerpt, CTA.
 * Green badge accent per DESIGN.md (blog = green).
 */
export default function BlogCard({ blog, className }: BlogCardProps) {
  const imageUrl = blog.coverImage?.url || '';
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
      <Link href={`/blog/${blog.slug}`} className="block">
        <div className="h-48 overflow-hidden">
          {imageUrl ? (
            <StrapiImage
              src={imageUrl}
              alt={blog.title}
              width={400}
              height={192}
              quality={75}
              objectFit="cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
        <Link href={`/blog/${blog.slug}`}>
          <h3 className="text-xl font-bold text-foreground mb-2 leading-snug line-clamp-2 hover:text-accent transition-colors">
            {blog.title}
          </h3>
        </Link>

        {/* Author + Date */}
        <div className="text-xs text-muted-foreground mb-4">
          {authorName} &bull; {formatDate(blog.publishedAt)}
        </div>

        {/* Description */}
        {blog.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
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

