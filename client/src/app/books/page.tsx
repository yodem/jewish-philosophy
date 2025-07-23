import { getWritingsByType, getPageBySlug } from "@/data/loaders";
import Link from "next/link";
import MediaCard from "@/components/ui/MediaCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlockRenderer from "@/components/blocks/BlockRenderer";

export default async function BooksPage() {
  const pageRes = await getPageBySlug("books");
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];
  const books = await getWritingsByType("book", 1, 10); // Get first 10 for mobile, will show 12 on desktop
  
  const [firstBook, ...restBooks] = books;

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "ספרים" },
        ]}
      />
      <BlockRenderer blocks={blocks} />
      {firstBook && (
        <div className="mb-8 sm:mb-12 flex flex-col items-center px-2 border-b border-gray-200 pb-8 w-full">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">ספר אחרון</h3>
          <Link href={`/books/${firstBook.slug}`} className="block w-full max-w-md sm:max-w-3xl">
            <MediaCard
              image={'/placeholder-book.jpg'}
              title={firstBook.title}
              description={firstBook.author.name}
              type="book"
              className="w-full"
              isLarge={true}
            />
          </Link>
          <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
            <h3 className="text-lg sm:text-xl font-semibold mt-2 sm:mt-4 text-center">תיאור</h3>
            <div className=" text-center max-w-full sm:max-w-2xl text-gray-700 px-2">
              {firstBook.description}
            </div>
          </div>
        </div>
      )}
      <div className="w-full">
      {restBooks.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">ספרים נוספים</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full max-w-7xl px-2 sm:px-4">
            {restBooks.map((book) => (
              <Link key={book.id} href={`/books/${book.slug}`}>
                                 <MediaCard
                   image={'/placeholder-book.jpg'}
                   title={book.title}
                   description={book.author.name}
                   type="book"
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