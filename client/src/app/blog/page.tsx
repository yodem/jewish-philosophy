import { getBlogsPaginated, getPageBySlug } from "@/data/loaders";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import FeaturedPostHero from "@/components/blog/FeaturedPostHero";
import { Suspense } from "react";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = generateMetadata({
  title: "בלוג | שלום צדיק - פילוסופיה דתית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה דתית",
  url: "/blog",
  type: "website",
  keywords:
    'בלוג פילוסופיה דתית, פילוסופיה דתית, הרמב"ם, מאמרי פילוסופיה, מושגים בפילוסופיה דתית, מבוא לפילוסופיה דתית, מורה נבוכים, משנה תורה, כוזרי, שלום צדיק, יהדות רציונלית, פילוסופיה דתית מתונה',
});

function HeroSkeleton() {
  return (
    <section className="mb-16">
      <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border grid md:grid-cols-2">
        <div className="h-64 md:h-full min-h-[400px] bg-muted animate-pulse" />
        <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
          <div className="h-5 w-full bg-muted rounded animate-pulse" />
          <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-12 w-32 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </section>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl overflow-hidden shadow-md border border-border"
        >
          <div className="h-48 bg-muted animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="flex gap-2">
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function BlogListPage() {
  const blogs = await getBlogsPaginated(1, 10);
  const [firstBlog, ...restBlogs] = blogs;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: "בית", href: "/" },
          { label: "בלוג" },
        ]}
      />

      {/* Featured Post Hero */}
      {firstBlog && (
        <Suspense fallback={<HeroSkeleton />}>
          <FeaturedPostHero blog={firstBlog} />
        </Suspense>
      )}

      {/* Blog Grid with infinite scroll */}
      <Suspense fallback={<GridSkeleton />}>
        <BlogPageClient initialBlogs={restBlogs} />
      </Suspense>
    </div>
  );
}
