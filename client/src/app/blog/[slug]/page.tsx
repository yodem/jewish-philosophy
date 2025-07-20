import BackButton from "@/components/BackButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getBlogBySlug, getAllBlogs } from "@/data/loaders";
import { Blog } from "@/types";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import GenericCarousel from "@/components/ui/GenericCarousel";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  
  if (!blog) {
    return {
      title: "Blog Post Not Found",
    };
  }
  
  return {
    title: `${blog.title} | Blog`,
    description: blog.description || blog.content.slice(0, 160),
  };
}

export async function generateStaticParams() {
  const blogs = await getAllBlogs();
  
  return blogs.map((blog: Blog) => ({
    slug: blog.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const blog = await getBlogBySlug(params.slug);
  
  if (!blog) {
    notFound();
  }
  
  const { title, content, publishedAt, author, coverImage, description } = blog;
  const publishDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Get other blogs for the carousel
  const allBlogs = await getAllBlogs();
  const otherBlogs = allBlogs.filter((b: Blog) => b.id !== blog.id);
  
  return (
    <div className="w-full max-w-full overflow-hidden">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: title }
      ]} />
      
      <BackButton />
      
      <div className="flex flex-col items-center mb-6 sm:mb-8 px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">{title}</h2>
        <div className="flex items-center text-gray-500 mb-4 text-sm">
          <span>{publishDate}</span>
          {author && (
            <>
              <span className="mx-2">•</span>
              <span>By {author}</span>
            </>
          )}
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl text-center">
          {description || ''}
        </p>
      </div>
      
      {coverImage && (
        <div className="mb-8 sm:mb-12 flex flex-col items-center px-2">
          <div className="block w-full max-w-md sm:max-w-3xl">
            <div className="relative aspect-video w-full">
              <Image
                src={coverImage.url}
                alt={title}
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto px-4 mt-8 mb-12">
        <div className="prose prose-lg max-w-none dark:prose-invert"
             dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      
      {otherBlogs.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">פוסטים נוספים</h3>
          <GenericCarousel 
            items={otherBlogs} 
            type="blog" 
            baseUrl="/blog"
          />
        </div>
      )}
    </div>
  );
} 