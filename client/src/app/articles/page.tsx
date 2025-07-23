import { getWritingsByType, getPageBySlug } from "@/data/loaders";
import Link from "next/link";
import MediaCard from "@/components/ui/MediaCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlockRenderer from "@/components/blocks/BlockRenderer";

export default async function ArticlesPage() {
  const pageRes = await getPageBySlug("articles");
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];
  const articles = await getWritingsByType("article", 1, 10); // Get first 10 for mobile, will show 12 on desktop
  
  const [firstArticle, ...restArticles] = articles;

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "מאמרים" },
        ]}
      />
      <BlockRenderer blocks={blocks} />
      {firstArticle && (
        <div className="mb-8 sm:mb-12 flex flex-col items-center px-2 border-b border-gray-200 pb-8 w-full">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">מאמר אחרון</h3>
          <Link href={`/articles/${firstArticle.slug}`} className="block w-full max-w-md sm:max-w-3xl">
            <MediaCard
              image={'/placeholder-article.jpg'}
              title={firstArticle.title}
              description={firstArticle.author.name}
              type="article"
              className="w-full"
              isLarge={true}
            />
          </Link>
          <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
            <h3 className="text-lg sm:text-xl font-semibold mt-2 sm:mt-4 text-center">תיאור</h3>
            <div className=" text-center max-w-full sm:max-w-2xl text-gray-700 px-2">
              {firstArticle.description}
            </div>
          </div>
        </div>
      )}
      <div className="w-full">
      {restArticles.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">מאמרים נוספים</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full max-w-7xl px-2 sm:px-4">
            {restArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                                 <MediaCard
                   image={'/placeholder-article.jpg'}
                   title={article.title}
                   description={article.author.name}
                   type="article"
                 />
              </Link>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 