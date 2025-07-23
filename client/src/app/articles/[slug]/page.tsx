import { getWritingBySlug } from "@/data/loaders";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CategoryBadge } from "@/components/CategoryBadge";
import Link from "next/link";
import { StrapiImage } from "@/components/StrapiImage";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getWritingBySlug(slug);

  if (!article || article.type !== 'article') {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "מאמרים", href: "/articles" },
          { label: article.title },
        ]}
      />

      <article className="prose prose-lg max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex justify-center items-center gap-4 text-gray-600 mb-6">
            <span>מאת: {article.author.name}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString('he-IL')}</span>
          </div>
          {article.categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {article.categories.map((category) => (
                <CategoryBadge key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>

        <div className="mb-8 text-center">
          <StrapiImage
            src={'/placeholder-article.jpg'}
            alt={article.title}
            width={600}
            height={400}
            className="rounded-lg mx-auto"
            priority
          />
        </div>

        <div className="text-center mb-8">
          <p className="text-lg leading-relaxed text-gray-700">{article.description}</p>
        </div>

        {article.linkToWriting?.href && (
          <div className="text-center mt-8">
            <Link
              href={article.linkToWriting.href}
              target={article.linkToWriting.isExternal ? "_blank" : "_self"}
              rel={article.linkToWriting.isExternal ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {article.linkToWriting?.text || 'קרא מאמר'}
              {article.linkToWriting?.isExternal && (
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