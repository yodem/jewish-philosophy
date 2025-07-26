import Breadcrumbs from "@/components/Breadcrumbs";
import { getBlogBySlug } from "@/data/loaders";
import { Category } from "@/types";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { StrapiImage } from "@/components/StrapiImage";
import { CategoryBadge } from "@/components/CategoryBadge";
import QuestionFormWrapper from "@/components/QuestionFormWrapper";
import ReactMarkdown from "react-markdown";
import { 
  fetchContentWithSEO, 
  strapiSEOPluginToMetadata, 
  generateSEOPluginStructuredData,
  validateSEOPluginContent,
  type ContentWithSEO 
} from "@/lib/strapi-seo-plugin";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Fetch blog content with official Strapi SEO plugin data
  const blogContent = await fetchContentWithSEO('blog', slug) as ContentWithSEO | null;
  
  if (!blogContent) {
    return {
      title: "Blog Post Not Found | פילוסופיה יהודית",
      description: "הפוסט המבוקש לא נמצא במערכת פילוסופיה יהודית",
    };
  }

  // Use official Strapi SEO plugin to generate metadata
  return strapiSEOPluginToMetadata(blogContent);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  
  if (!blog) {
    notFound();
  }
  
  const { title, content, publishedAt, author, coverImage, description, categories } = blog;

  const publishDate = new Date(publishedAt).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch the same content with SEO plugin data for structured data
  const blogWithSEO = await fetchContentWithSEO('blog', slug) as ContentWithSEO | null;
  
  // Generate structured data using the official Strapi SEO plugin
  const structuredData = blogWithSEO 
    ? generateSEOPluginStructuredData(blogWithSEO, 'Article')
    : {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description || content.slice(0, 160),
        "inLanguage": "he-IL"
      };

  // Optional: Validate SEO content for debugging
  if (blogWithSEO && process.env.NODE_ENV === 'development') {
    const validation = validateSEOPluginContent(blogWithSEO);
    console.log(`SEO Score for "${title}": ${validation.seoScore}/100`, {
      warnings: validation.warnings,
      errors: validation.errors
    });
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto max-w-3xl w-full overflow-hidden px-2 sm:px-4 sm:max-w-5xl">
        <Breadcrumbs items={[
          { label: 'בית', href: '/' },
          { label: 'בלוג', href: '/blog' },
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
        <article className="prose prose-lg max-w-none dark:prose-invert text-justify">
        <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </div>
      <div className="mt-10 border-t pt-8 mx-auto w-full max-w-xl sm:max-w-2xl px-2 sm:px-4">
        <QuestionFormWrapper />
      </div>
    </div>
    </>
  );
} 