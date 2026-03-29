import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTermBySlug } from '@/data/loaders';
import { generateMetadata as createMetadata } from '@/lib/metadata';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { FullCategoryList } from '@/components/shared/LimitedCategoryList';
import { BookMarked } from 'lucide-react';

interface TermPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TermPage({ params }: TermPageProps) {
  const { slug } = await params;
  const term = await getTermBySlug(slug);

  if (!term) {
    notFound();
  }

  const publishedDate = new Date(term.publishedAt).toLocaleDateString('he-IL');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: "בית", href: "/" },
          { label: "מושגים", href: "/terms" },
          { label: term.title }
        ]}
      />

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col items-center">
          <div className="w-full text-right pr-5 mb-8">
            <div className="bg-ct-term/10 text-ct-term/90 border border-ct-term/20 px-2.5 py-1 rounded text-sm font-bold inline-flex items-center gap-1.5 mb-3 uppercase tracking-wider">
              <BookMarked className="size-4" />
              מושג
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
              {term.title}
            </h1>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
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
              {publishedDate}
            </span>
          </div>

          {/* Categories */}
          {term.categories && term.categories.length > 0 && (
            <div className="flex justify-center w-full">
              <FullCategoryList categories={term.categories} isSelectable={false} />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-right mx-auto">
          <div className="rounded-xl p-6 md:p-8 shadow-sm border border-border/60 bg-card">
            <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap text-justify">
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
    return createMetadata({
      title: 'מושג לא נמצא | שלום צדיק - פילוסופיה דתית',
      description: 'פלטפורמה מקוונת ללימוד פילוסופיה דתית',
      url: `/terms/${slug}`,
    });
  }

  const description = term.description || 'פלטפורמה מקוונת ללימוד פילוסופיה דתית';

  return createMetadata({
    title: `${term.title} | מושגים | שלום צדיק - פילוסופיה דתית`,
    description,
    url: `/terms/${slug}`,
    type: 'article',
    publishedTime: term.publishedAt,
    modifiedTime: term.updatedAt,
    authors: term.author ? [term.author.name] : undefined,
    keywords: term.categories?.map(cat => cat.name).join(', ') || 'פילוסופיה דתית, מושגים',
  });
}
