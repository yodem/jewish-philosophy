import Link from 'next/link';
import { StrapiImage } from '@/components/StrapiImage';
import { CategoryPill } from './BlogCard';
import { formatDate } from '@/lib/date-utils';
import type { Blog } from '@/types';

interface FeaturedPostHeroProps {
  blog: Blog;
}

/**
 * Stitch-style featured post hero: 2-column grid layout.
 * Left: full-height cover image.
 * Right: category badges, title, author+date, description, CTA button.
 */
export default function FeaturedPostHero({ blog }: FeaturedPostHeroProps) {
  const imageUrl = blog.coverImage?.url || '';
  const authorName = blog.author?.name || 'המערכת';

  return (
    <section className="mb-16">
      <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border grid md:grid-cols-2">
        {/* Image column - full height */}
        <div className="relative h-64 md:h-full min-h-[400px] overflow-hidden">
          {imageUrl ? (
            <StrapiImage
              src={imageUrl}
              alt={blog.title}
              width={800}
              height={600}
              quality={85}
              objectFit="cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">אין תמונה</span>
            </div>
          )}
        </div>

        {/* Content column */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {/* Category pills */}
          {blog.categories && blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.categories.map((category) => (
                <span
                  key={category.id}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {blog.title}
          </h2>

          {/* Author + Date */}
          <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
            <span className="font-bold text-foreground/80">{authorName}</span>
            <span>&bull;</span>
            <span>{formatDate(blog.publishedAt)}</span>
          </div>

          {/* Description */}
          {blog.description && (
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {blog.description}
            </p>
          )}

          {/* CTA Button */}
          <Link
            href={`/blog/${blog.slug}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all w-fit"
          >
            קרא עוד
            <svg
              className="w-4 h-4 ms-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
