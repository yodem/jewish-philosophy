import Breadcrumbs from "@/components/Breadcrumbs";
import { getBlogBySlug, getBlogCommentsBySlug } from "@/data/loaders";
import { Category, Blog } from "@/types";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { StrapiImage } from "@/components/StrapiImage";
import { CategoryBadge } from "@/components/CategoryBadge";
import QuestionFormWrapper from "@/components/QuestionFormWrapper";
import { WritingViewTracker } from "@/components/WritingTracker";
import BlogCommentSection from "./BlogCommentSection";
import BlogContentWrapper from "@/components/BlogContentWrapper";
import { JsonLd } from "@/lib/json-ld";
import { Article as ArticleSchema, WithContext } from "schema-dts";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Fetch blog content using standard getBlogBySlug
  const blog = await getBlogBySlug(slug) as Blog | null;
  
  if (!blog) {
    return {
      title: "הפוסט לא נמצא | פילוסופיה יהודית",
      description: "הפוסט המבוקש לא נמצא במערכת פילוסופיה יהודית",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/';
  const pageUrl = `${baseUrl}/blog/${slug}`;
  const imageUrl = blog.coverImage?.url ? `${process.env.STRAPI_BASE_URL || ''}${blog.coverImage.url}` : undefined;

  return {
    title: `${blog.title} | בלוג - פילוסופיה יהודית`,
    description: blog.description || blog.content.slice(0, 160),
    keywords: blog.categories?.map(cat => cat.name).join(', ') || 'פילוסופיה יהודית, בלוג',
    authors: [{ name: blog.author.name }],
    openGraph: {
      title: blog.title,
      description: blog.description || blog.content.slice(0, 160),
      url: pageUrl,
      siteName: 'פילוסופיה יהודית',
      locale: 'he_IL',
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: [blog.author.name],
      images: imageUrl ? [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: blog.title
      }] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
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
  
  const { title, content, publishedAt, author, coverImage, description, categories } = blog;

  const publishDate = new Date(publishedAt).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate structured data for the blog post
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/';
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
      "name": "פילוסופיה יהודית",
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
      <div className="mx-auto max-w-3xl w-full overflow-hidden px-2 sm:px-4 sm:max-w-5xl">
        {/* Track blog post view */}
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
      
      {/* <BackButton /> */}
      
      <div className="flex flex-col items-center mb-6 sm:mb-8 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">{title}</h2>
        <div className="flex items-center text-gray-500 mb-4 text-sm">
          <span>{publishDate}</span>
          {author && (
            <>
              <span className="mx-2">•</span>
              <span> {author.name}</span>
            </>
          )}
        </div>
        
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {categories.map((category: Category) => (
              <CategoryBadge key={category.id} category={category} />
            ))}
          </div>
        )}
        
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl text-justify">
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
    </>
  );
} 