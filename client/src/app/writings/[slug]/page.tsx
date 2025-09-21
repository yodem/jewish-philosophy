import { getWritingBySlug } from "@/data/loaders";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FullCategoryList } from "@/components/LimitedCategoryList";
import Link from "next/link";
import { StrapiImage } from "@/components/StrapiImage";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { generateMetadata as createMetadata, getImageUrl } from "@/lib/metadata";
import { WritingViewTracker, WritingButtonTracker } from "@/components/WritingTracker";
import { JsonLd } from "@/lib/json-ld";
import { Article, Book, WithContext } from "schema-dts";

interface WritingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WritingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);
  
  if (!writing) {
    return {
      title: "Writing Not Found",
    };
  }

  return createMetadata({
    title: `${writing.title} | כתבים - פילוסופיה יהודית`,
    description: writing.description,
    url: `/writings/${slug}`,
    type: "article",
    image: getImageUrl(writing.image?.url),
    publishedTime: writing.publishedAt,
    authors: [writing.author.name],
    tags: writing.categories?.map(cat => cat.name) || undefined,
    keywords: `${writing.type === 'book' ? 'ספר יהודי' : 'מאמר יהודי'}, ${writing.categories?.map(cat => cat.name).join(', ')}, ${writing.author.name}, לימודי יהדות, בית מדרש דיגיטלי`,
  });
}

export default async function WritingPage({ params }: WritingPageProps) {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);

  if (!writing) {
    notFound();
  }

  const isBook = writing.type === 'book';
  const typeLabel = isBook ? 'ספר' : 'מאמר';
  const defaultButtonText = isBook ? 'צפייה בספר' : 'קרא מאמר';

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  const pageUrl = `${baseUrl}/writings/${slug}`;
  const imageUrl = writing.image?.url ? `${process.env.STRAPI_BASE_URL || ''}${writing.image.url}` : undefined;

  // Structured data for the writing
  const structuredData: WithContext<Article | Book> = {
    "@context": "https://schema.org",
    "@type": isBook ? "Book" : "Article",
    "name": writing.title,
    "headline": writing.title,
    "description": writing.description,
    "image": imageUrl ? [imageUrl] : undefined,
    "datePublished": writing.publishedAt,
    "dateModified": writing.updatedAt,
    "author": {
      "@type": "Person",
      "name": writing.author.name,
    },
    "publisher": {
      "@type": "Organization",
      "name": "פילוסופיה יהודית",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "keywords": writing.categories?.map(cat => cat.name).join(', '),
    "genre": writing.categories?.[0]?.name,
    "inLanguage": "he-IL",
    "url": pageUrl,
    ...(isBook && {
      "bookFormat": "EBook",
      "numberOfPages": undefined, // You can add this if available in your data
    }),
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="container mx-auto py-8 px-4">
        {/* Track writing page view */}
        <WritingViewTracker 
          writingTitle={writing.title}
          writingType={writing.type}
          author={writing.author.name}
        />
        
        <Breadcrumbs
          items={[
            { label: "בית", href: "/" },
            { label: "כתבים", href: "/writings" },
            { label: writing.title },
          ]}
        />

      <article className="prose prose-lg max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isBook 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                : 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
            }`}>
              {typeLabel}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{writing.title}</h1>
          <div className="flex justify-center items-center gap-4 text-gray-600 mb-6">
            <span>מאת: {writing.author.name}</span>
            <span>•</span>
            <span>{new Date(writing.publishedAt).toLocaleDateString('he-IL')}</span>
          </div>
          {writing.categories.length > 0 && (
            <div className="mb-6 flex justify-center">
              <FullCategoryList categories={writing.categories} />
            </div>
          )}
        </div>

        {writing.image && <div className="mb-8 text-center">
          <StrapiImage
            src={writing.image.url}
            alt={writing.title}
            width={600}
            height={400}
            className="rounded-lg mx-auto"
            priority
          />
        </div>}

        <div className="text-center mb-8">
          <p className="text-lg leading-relaxed text-gray-700 text-justify">{writing.description}</p>
        </div>

        {writing.linkToWriting?.href && (
          <div className="text-center mt-8">
            <WritingButtonTracker
              writingTitle={writing.title}
              writingType={writing.type}
              author={writing.author.name}
              isExternal={writing.linkToWriting.isExternal || false}
            >
              <Link
                href={writing.linkToWriting.href}
                target={writing.linkToWriting.isExternal ? "_blank" : "_self"}
                rel={writing.linkToWriting.isExternal ? "noopener noreferrer" : undefined}
              >
                <Button
                  variant="default"
                  className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {writing.linkToWriting?.text || defaultButtonText}
                  {writing.linkToWriting?.isExternal && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                </Button>
              </Link>
            </WritingButtonTracker>
          </div>
        )}
      </article>
    </div>
    </>
  );
} 