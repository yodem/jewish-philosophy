import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FullCategoryList } from "@/components/LimitedCategoryList";
import { Responsa } from "@/types";
import ReactMarkdown from "react-markdown";
import { JsonLd } from "@/lib/json-ld";
import { QAPage, WithContext } from "schema-dts";
import SefariaLinker from "@/components/SefariaLinker";
import remarkGfm from "remark-gfm";
import ViewCountTracker from "@/components/ViewCountTracker";
import ResponsaCommentWrapper from "./ResponsaCommentWrapper";

interface ResponsaPageProps {
  responsa: Responsa;
  slug: string;
}

export default function ResponsaPage({ responsa, slug }: ResponsaPageProps) {
  
  const { title, content, questioneer, publishedAt, categories } = responsa;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app';
  const pageUrl = `${baseUrl}/responsa/${slug}`;

  const structuredData: WithContext<QAPage> = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: title,
      text: title,
      answerCount: 1,
      upvoteCount: 0, 
      dateCreated: publishedAt,
      author: {
        '@type': 'Person',
        name: questioneer,
      },
      acceptedAnswer: {
        '@type': 'Answer',
        text: content,
        url: pageUrl,
        upvoteCount: 0,
        dateCreated: publishedAt,
        author: {
          '@type': 'Person',
          name: 'שלום צדיק', 
        },
      },
    },
  };
  
  return (
    <div className="container mx-auto py-8">
      <JsonLd data={structuredData} />
      {responsa && <ViewCountTracker contentType="responsas" contentId={responsa.id.toString()} />}
      <Breadcrumbs items={[
        { label: "בית", href: "/" },
        { label: "שו״ת", href: "/responsa" },
        { label: title }
      ]} />
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          
          <div className="flex flex-wrap items-center text-gray-500 mb-4 text-sm gap-2">
            <span>נשאל על ידי: {questioneer}</span>
            <span>•</span>
            <span>{formatDate(publishedAt)}</span>
          </div>
          
          {categories && categories.length > 0 && (
            <div className="mb-4">
              <FullCategoryList categories={categories} />
            </div>
          )}
          
          <div className="prose prose-lg max-w-none dark:prose-invert bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-justify overflow-hidden">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Sefaria Linker for automatic citation linking */}
        <SefariaLinker />

        <ResponsaCommentWrapper 
          initialComments={responsa.comments || []}
          responsaSlug={responsa.slug}
          slug={slug}
          responsaTitle={responsa.title}
        />
      </div>
    </div>
  );
}
