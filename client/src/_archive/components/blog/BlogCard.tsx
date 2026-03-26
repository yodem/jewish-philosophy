'use client';

import Link from 'next/link';
import { StrapiImage } from '@/components/StrapiImage';
import { cn } from '@/lib/utils';
import type { Blog, Category } from '@/types';
import { formatDate } from '@/lib/date-utils';

/**
 * Stitch-style small pill badge colors for blog category badges.
 * Maps category slugs to pastel bg + darker text color pairs.
 */
const PILL_COLORS: Record<string, string> = {
  soul: 'bg-blue-100 text-blue-700',
  aristotelianism: 'bg-amber-100 text-amber-700',
  general: 'bg-muted text-muted-foreground',
  moral: 'bg-emerald-100 text-emerald-700',
  evil: 'bg-teal-100 text-teal-700',
  aristotle: 'bg-amber-100 text-amber-700',
  mimonidies: 'bg-orange-100 text-orange-700',
  mind: 'bg-indigo-100 text-indigo-700',
  family: 'bg-purple-100 text-purple-700',
  hazal: 'bg-yellow-100 text-yellow-700',
  'free-will': 'bg-violet-100 text-violet-700',
  messiah: 'bg-fuchsia-100 text-fuchsia-700',
  kabalah: 'bg-pink-100 text-pink-700',
  plato: 'bg-fuchsia-100 text-fuchsia-700',
  platonism: 'bg-orange-100 text-orange-700',
  rasag: 'bg-indigo-100 text-indigo-700',
  god: 'bg-cyan-100 text-cyan-700',
  spinoza: 'bg-cyan-100 text-cyan-700',
  kant: 'bg-muted text-muted-foreground',
  'modern-science': 'bg-sky-100 text-sky-700',
  determinism: 'bg-violet-100 text-violet-700',
  pure: 'bg-red-100 text-red-700',
  reform: 'bg-red-100 text-red-700',
};

function getCategoryPillClass(category: Category): string {
  return PILL_COLORS[category.slug] || 'bg-blue-100 text-blue-700';
}

function CategoryPill({ category }: { category: Category }) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider',
        getCategoryPillClass(category)
      )}
    >
      {category.name}
    </span>
  );
}

interface BlogCardProps {
  blog: Blog;
  className?: string;
}

/**
 * Stitch-style blog card with:
 * - Image with hover zoom
 * - Category pills (small pastel badges)
 * - Title, date, description
 * - "להמשך קריאה" link
 */
export default function BlogCard({ blog, className }: BlogCardProps) {
  const imageUrl = blog.coverImage?.url || '';
  const authorName = blog.author?.name || 'המערכת';

  return (
    <article
      className={cn(
        'bg-card rounded-xl overflow-hidden shadow-md border border-border',
        'hover:shadow-lg transition-all group',
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
      <div className="p-6">
        {/* Category pills */}
        {blog.categories && blog.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {blog.categories.slice(0, 3).map((category) => (
              <CategoryPill key={category.id} category={category} />
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
          className="text-accent font-bold text-sm hover:underline inline-flex items-center"
        >
          להמשך קריאה
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

export { CategoryPill, getCategoryPillClass };
