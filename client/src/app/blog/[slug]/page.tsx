import Breadcrumbs from "@/components/Breadcrumbs";
import { getBlogBySlug, getBlogCommentsBySlug } from "@/data/loaders";
import { Category, Blog } from "@/types";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { StrapiImage } from "@/components/StrapiImage";
import { FullCategoryList } from "@/components/LimitedCategoryList";
import QuestionFormWrapper from "@/components/QuestionFormWrapper";
import { WritingViewTracker } from "@/components/WritingTracker";
import BlogCommentSection from "./BlogCommentSection";
import BlogContentWrapper from "@/components/blog/BlogContentWrapper";
import { JsonLd } from "@/lib/json-ld";
import { Article as ArticleSchema, WithContext } from "schema-dts";
import SefariaLinker from "@/components/SefariaLinker";
import ViewCountTracker from "@/components/ViewCountTracker";
import { generateMetadata as createMetadata } from "@/lib/metadata";
import { generateBlogDescription } from "@/lib/seo-helpers";
import { calculateReadingTime } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug) as Blog | null;

  if (!blog) {
    return {
      title: "הפוסט לא נמצא | שלום צדיק - פילוסופיה דתית",
      description: "פלטפורמה מקוונת ללימוד פילוסופיה דתית",
    };
  }

  const imageUrl = blog.coverImage?.url;
  const blogDescription = generateBlogDescription(blog);

  return createMetadata({
    title: `${blog.title} | בלוג | שלום צדיק - פילוסופיה דתית`,
    description: blogDescription,
    url: `/blog/${slug}`,
    type: "article",
    image: imageUrl,
    publishedTime: blog.publishedAt,
    authors: [blog.author.name],
    tags: blog.categories?.map((cat: Category) => cat.name),
    keywords: blog.categories?.map(cat => cat.name).join(', ') || 'פילוסופיה דתית, בלוג',
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [blog, comments] = await Promise.all([
    getBlogBySlug(slug),
    getBlogCommentsBySlug(slug)
  ]);

  if (!blog) {
    notFound();
  }

  const { title, content, publishedAt, author, coverImage, description, categories, views } = blog;
  const publishDate = formatDate(publishedAt);
  const readingTime = calculateReadingTime(content);

  // Structured data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/';
  const pageUrl = `${baseUrl}/blog/${slug}`;
  const imageUrl = coverImage?.url ? `${process.env.STRAPI_BASE_URL || ''}${coverImage.url}` : undefined;

  const structuredData: WithContext<ArticleSchema> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description || content.slice(0, 160),
    "url": pageUrl,
    "datePublished": publishedAt,
    "inLanguage": "he-IL",
    "author": {
      "@type": "Person",
      "name": author?.name || 'Unknown'
    },
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "פילוסופיה דתית",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    ...(imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": imageUrl,
        "width": 1200,
        "height": 630
      }
    }),
    ...(categories && categories.length > 0 && {
      "keywords": categories.map((cat: Category) => cat.name).join(', ')
    })
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ViewCountTracker contentType="blogs" contentId={blog.id.toString()} />
      <div className="mx-auto max-w-3xl w-full overflow-hidden px-2 sm:px-4 sm:max-w-5xl">
        <WritingViewTracker
          writingTitle={title}
          writingType="blog"
          author={author?.name || 'Unknown'}
        />

        <Breadcrumbs items={[
          { label: "בית", href: "/" },
          { label: "בלוג", href: "/blog" },
          { label: title }
        ]} />

        <div className="flex flex-col items-center mb-6 sm:mb-8 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">{title}</h2>
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-muted-foreground mb-4 text-sm">
            <span>{publishDate}</span>
            {author && (
              <>
                <span>&bull;</span>
                <span>{author.name}</span>
              </>
            )}
            <span>&bull;</span>
            <span>{readingTime} דקות קריאה</span>
            {views != null && views > 0 && (
              <>
                <span>&bull;</span>
                <span>{views.toLocaleString('he-IL')} צפיות</span>
              </>
            )}
          </div>

          {categories && categories.length > 0 && (
            <div className="mb-4 flex justify-center">
              <FullCategoryList categories={categories} />
            </div>
          )}

          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl text-justify">
            {description || ''}
          </p>
        </div>

        {coverImage && (
          <div className="mb-8 sm:mb-12 flex flex-col items-center w-full">
            <div className="block w-full max-w-md sm:max-w-3xl">
              <div className="relative aspect-video w-full">
                <StrapiImage
                  src={coverImage.url}
                  alt={title}
                  width={900}
                  height={600}
                  className="object-cover rounded-lg w-full h-full"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        <div className="w-full mx-auto mt-8 mb-12 overflow-x-auto px-0 sm:px-4">
          <BlogContentWrapper content={content} />
        </div>

        {/* Comments Section */}
        <div className="mt-10 border-t pt-8 mx-auto w-full max-w-3xl px-2 sm:px-4">
          <BlogCommentSection
            initialComments={comments}
            blogSlug={slug}
          />
        </div>

        <div className="mt-10 border-t pt-8 mx-auto w-full max-w-xl sm:max-w-2xl px-2 sm:px-4">
          <QuestionFormWrapper />
        </div>
      </div>
      <SefariaLinker />
    </>
  );
}
