import { getBlogsPaginated, getPageBySlug } from "@/data/loaders";
import Link from "next/link";
import MediaCard from "@/components/ui/MediaCard";
import BlogGrid from "@/components/BlogGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlockRenderer from "@/components/blocks/BlockRenderer";

export default async function BlogListPage() {
  const pageRes = await getPageBySlug("blog");
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];
  const blogs = await getBlogsPaginated(1, 10); // Get first 10 for mobile, will show 12 on desktop
  const [firstBlog, ...restBlogs] = blogs;
  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "בית", href: "/" },
          { label: "בלוג" },
        ]}
      />
      <BlockRenderer blocks={blocks} />
      {firstBlog && (
        <div className="mb-8 sm:mb-12 flex flex-col items-center px-2 border-b border-gray-200 pb-8 w-full">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">מאמר אחרון</h3>
          <Link href={`/blog/${firstBlog.slug}`} className="block w-full max-w-md sm:max-w-3xl">
            <MediaCard
              image={firstBlog.coverImage?.url || ''}
              title={firstBlog.title}
              description={firstBlog?.author?.name || 'המערכת'}
              type="blog"
              className="w-full"
              isLarge={true}
            />
          </Link>
          <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
            <h3 className="text-lg sm:text-xl font-semibold mt-2 sm:mt-4 text-center">תיאור</h3>
            <div className="max-w-full sm:max-w-2xl text-gray-700 px-2 text-justify">
              {firstBlog.description}
            </div>
          </div>

        </div>
      )}
      <div className="w-full">
      {restBlogs.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">מאמרים נוספים</h3>
          <BlogGrid 
            initialBlogs={restBlogs} 
            baseUrl="/blog"
          />
        </div>
      )}
      </div>
      
    </div>
  );
} 