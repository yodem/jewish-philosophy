import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTermBySlug } from '@/data/loaders';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CategoryBadge } from '@/components/CategoryBadge';
import { generateSEOMetadata } from '@/lib/seo-helpers';

interface TermPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TermPage({ params }: TermPageProps) {
  const { slug } = await params;
  const term = await getTermBySlug(slug);

  if (!term) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "בית", href: "/" },
          { label: "מושגים", href: "/terms" },
          { label: term.title }
        ]}
      />
      
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-right leading-tight">
            {term.title}
          </h1>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {term.author && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                מאת: {term.author.name}
              </span>
            )}
            
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {new Date(term.publishedAt).toLocaleDateString('he-IL')}
            </span>
          </div>

          {/* Categories */}
          {term.categories && term.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {term.categories.map((category) => (
                <CategoryBadge
                  key={category.id}
                  category={category}
                  isSelectable={false}
                />
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-right mx-auto">
          <div className="bg-gradient-to-br from-white via-white to-cyan-100 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-200/20 rounded-xl p-8 shadow-sm border">
            <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-justify">
              {term.description}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

export async function generateMetadata({ params }: TermPageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = await getTermBySlug(slug);

  if (!term) {
    return {
      title: 'מושג לא נמצא',
    };
  }

  return generateSEOMetadata({
    title: term.title,
    description: term.description.substring(0, 160),
    path: `/terms/${slug}`,
    publishedTime: term.publishedAt,
    modifiedTime: term.updatedAt,
    authors: term.author ? [term.author.name] : undefined,
    section: 'מושגים',
    tags: term.categories?.map(cat => cat.name) || [],
  });
}
