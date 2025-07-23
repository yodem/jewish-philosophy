import { getWritingBySlug } from "@/data/loaders";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CategoryBadge } from "@/components/CategoryBadge";
import Link from "next/link";
import { StrapiImage } from "@/components/StrapiImage";

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = await getWritingBySlug(slug);

  if (!book || book.type !== 'book') {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "ספרים", href: "/books" },
          { label: book.title },
        ]}
      />

      <article className="prose prose-lg max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{book.title}</h1>
          <div className="flex justify-center items-center gap-4 text-gray-600 mb-6">
            <span>מאת: {book.author.name}</span>
            <span>•</span>
            <span>{new Date(book.publishedAt).toLocaleDateString('he-IL')}</span>
          </div>
          {book.categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {book.categories.map((category) => (
                <CategoryBadge key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>

        <div className="mb-8 text-center">
          <StrapiImage
            src={'/placeholder-book.jpg'}
            alt={book.title}
            width={600}
            height={400}
            className="rounded-lg mx-auto"
            priority
          />
        </div>

        <div className="text-center mb-8">
          <p className="text-lg leading-relaxed text-gray-700">{book.description}</p>
        </div>

        {book.linkToWriting?.href && (
          <div className="text-center mt-8">
            <Link
              href={book.linkToWriting.href}
              target={book.linkToWriting.isExternal ? "_blank" : "_self"}
              rel={book.linkToWriting.isExternal ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {book.linkToWriting?.text || 'צפייה בספר'}
              {book.linkToWriting?.isExternal && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </Link>
          </div>
        )}
      </article>
    </div>
  );
} 