"use client";

import React, { useEffect, useState, useCallback } from "react";
import { notFound, useParams } from "next/navigation";
import { getResponsaBySlug, getResponsaCommentsBySlug } from "@/data/loaders";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FullCategoryList } from "@/components/LimitedCategoryList";
import { Comment as CommentType, Responsa } from "@/types";
import CommentSection from "@/components/CommentSection";
import { ContentSkeleton, Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { trackContentView } from "@/lib/analytics";
import { JsonLd } from "@/lib/json-ld";
import { QAPage, WithContext } from "schema-dts";
import SefariaLinker from "@/components/SefariaLinker";

export default function ResponsaPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [responsa, setResponsa] = useState<Responsa | null>(null);
  const [commentsData, setCommentsData] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadResponsa = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getResponsaBySlug(slug);
      setResponsa(data);
      setCommentsData(data?.comments || []);
    } catch (error) {
      console.error("Error loading responsa:", error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadResponsa();
  }, [loadResponsa]);

  // Track responsa view when data is loaded
  useEffect(() => {
    if (responsa && !isLoading) {
      trackContentView(responsa.title, 'responsa', 'שלום צדיק');
    }
  }, [responsa, isLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        {/* Breadcrumbs skeleton */}
        <div className="mb-4">
          <Skeleton className="h-4 w-48 bg-gray-200" />
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8 space-y-4">
            <Skeleton className="h-8 w-3/4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32 bg-gray-200" />
              <Skeleton className="h-4 w-20 bg-gray-200" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 bg-gray-200 rounded-full" />
              <Skeleton className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="bg-gray-50 p-6 rounded-lg mb-12">
            <ContentSkeleton />
          </div>
          
          {/* Comments section skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-32 bg-gray-200" />
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                </div>
                <Skeleton className="h-20 w-full bg-gray-200" />
              </div>
            </div>
            
            {/* Comment form skeleton */}
            <div className="mt-12 space-y-4">
              <Skeleton className="h-6 w-32 bg-gray-200" />
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <Skeleton className="h-10 w-full bg-gray-200" />
                <Skeleton className="h-32 w-full bg-gray-200" />
                <Skeleton className="h-10 w-24 bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!responsa) {
    notFound();
  }
  
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
          
          {/* Related writings */}
          {responsa.writings && responsa.writings.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
                כתבים קשורים:
              </h4>
              <div className="flex flex-wrap gap-3">
                {responsa.writings.map((writing) => (
                  <Link
                    key={writing.id}
                    href={`/writings/${writing.slug}`}
                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-800/30 border border-blue-300 dark:border-blue-600 text-blue-800 dark:text-blue-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <span className="text-sm font-medium">{writing.title}</span>
                    {writing.type && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full">
                        {writing.type === 'book' ? 'ספר' : 'מאמר'}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="prose prose-lg max-w-none dark:prose-invert bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-justify break-words overflow-wrap-anywhere">
            <ReactMarkdown
              components={{
                a: ({ children, href }) => {
                  return <Link href={href || '#'}><span>{children}</span></Link>
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Sefaria Linker for automatic citation linking */}
        <SefariaLinker />

        <CommentSection 
          initialComments={commentsData}
          responsaSlug={responsa.slug}
          commentType="responsa"
          onCommentsRefresh={getResponsaCommentsBySlug}
        />
      </div>
    </div>
  );
} 