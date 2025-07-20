import { getAllBlogs, getPageBySlug } from "@/data/loaders";
import { Blog } from "@/types";
import Link from "next/link";
import MediaCard from "@/components/ui/MediaCard";
import GenericCarousel from "@/components/ui/GenericCarousel";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlockRenderer from "@/components/blocks/BlockRenderer";

export default async function BlogListPage() {
  const pageRes = await getPageBySlug("blog");
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];
  const blogs = await getAllBlogs();
  
  const [firstBlog, ...restBlogs] = blogs;

  return (
    <div className="w-full flex flex-col items-center max-w-full overflow-hidden">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
      />
      <BlockRenderer blocks={blocks} />
      {firstBlog && (
        <div className="mb-8 sm:mb-12 flex flex-col items-center px-2 border-b border-gray-200 pb-8 w-fit">
          <Link href={`/blog/${firstBlog.slug}`} className="block w-full max-w-md sm:max-w-3xl">
            <MediaCard
              image={firstBlog.coverImage?.url || ''}
              title={firstBlog.title}
              description={firstBlog.author.name}
              type="blog"
              className="w-full"
              isLarge={true}
            />
          </Link>
          <div className="mt-4 text-center max-w-full sm:max-w-2xl text-gray-700 px-2">
            {firstBlog.description}
          </div>

        </div>
      )}
      <div className="w-full">
      {restBlogs.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">מאמרים נוספים</h3>
          <GenericCarousel 
            items={restBlogs} 
            type="blog" 
            baseUrl="/blog"
          />
        </div>
      )}
      </div>
    </div>
  );
} 