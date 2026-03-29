import Link from "next/link";
import { StrapiImage } from "@/components/shared/StrapiImage";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { formatDate } from "@/lib/date-utils";
import type { Blog } from "@/types";
import { getStrapiMediaEntryUrl } from "@/lib/strapi-media";
import { cn } from "@/lib/utils";

interface FeaturedPostHeroProps {
  blog: Blog;
}

const postHref = (slug: string) => `/blog/${slug}`;

/**
 * Featured post: responsive 2-column card (stacked on small screens).
 * Cover uses next/image fill inside a sized, relative box; entire image area links to the post.
 */
export default function FeaturedPostHero({ blog }: FeaturedPostHeroProps) {
  const imageUrl = getStrapiMediaEntryUrl(blog.coverImage);
  const authorName = blog.author?.name || "המערכת";
  const href = postHref(blog.slug);

  return (
    <section className="mb-16" aria-labelledby="featured-post-title">
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 md:items-stretch",
          "overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
        )}
      >
        {/* Cover — must be a positioned, sized box for StrapiImage fill */}
        <Link
          href={href}
          className={cn(
            "relative isolate block w-full bg-muted outline-none",
            "min-h-[min(52vw,320px)] sm:min-h-[300px]",
            "md:h-full md:min-h-[400px]"
          )}
        >
          {imageUrl ? (
            <StrapiImage
              src={imageUrl}
              alt={blog.title}
              fill
              quality={85}
              objectFit="cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-sm text-muted-foreground">אין תמונה</span>
            </div>
          )}
        </Link>

        {/* Copy */}
        <div className="flex min-h-0 flex-col justify-center gap-6 p-8 md:p-10 lg:p-12">
          {blog.categories && blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.categories.map((category) => (
                <CategoryBadge key={category.id} category={category} isSelectable={false} />
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h2
              id="featured-post-title"
              className="text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl"
            >
              <Link
                href={href}
                className="text-balance hover:text-accent focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {blog.title}
              </Link>
            </h2>

            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground/90">{authorName}</span>
              <span aria-hidden className="text-muted-foreground/60">
                &bull;
              </span>
              <time dateTime={blog.publishedAt}>{formatDate(blog.publishedAt)}</time>
            </p>
          </div>

          {blog.description ? (
            <p className="line-clamp-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              {blog.description}
            </p>
          ) : null}

          <Link
            href={href}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            קראו עוד
            <svg
              className="size-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
