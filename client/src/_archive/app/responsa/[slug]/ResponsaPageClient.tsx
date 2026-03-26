import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FullCategoryList } from "@/components/LimitedCategoryList";
import { Responsa, Comment } from "@/types";
import ReactMarkdown from "react-markdown";
import { JsonLd } from "@/lib/json-ld";
import { QAPage, WithContext } from "schema-dts";
import remarkGfm from "remark-gfm";
import ViewCountTracker from "@/components/ViewCountTracker";
import ResponsaCommentWrapper from "./ResponsaCommentWrapper";
import { extractTextFromMarkdown } from "@/lib/seo-helpers";

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

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/').replace(/\/?$/, '');
  const pageUrl = `${baseUrl}/responsa/${slug}`;
  const aboutUrl = `${baseUrl}/about`;

  // Build suggestedAnswer from comments and threads for SEO (indexed with main Q&A)
  const suggestedAnswers: { '@type': 'Answer'; text: string; dateCreated: string; author: { '@type': 'Person'; name: string; url: string } }[] = [];
  (responsa.comments || []).forEach((comment: Comment) => {
    const commentText = extractTextFromMarkdown(comment.answer, 5000);
    if (commentText) {
      suggestedAnswers.push({
        '@type': 'Answer',
        text: commentText,
        dateCreated: comment.publishedAt || comment.createdAt,
        author: { '@type': 'Person', name: comment.answerer, url: pageUrl },
      });
    }
    (comment.threads || []).forEach((thread) => {
      const threadText = extractTextFromMarkdown(thread.answer, 5000);
      if (threadText) {
        suggestedAnswers.push({
          '@type': 'Answer',
          text: threadText,
          dateCreated: thread.publishedAt || thread.createdAt,
          author: { '@type': 'Person', name: thread.answerer, url: pageUrl },
        });
      }
    });
  });

  const structuredData: WithContext<QAPage> = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: title,
      text: title,
      answerCount: 1 + suggestedAnswers.length,
      upvoteCount: 0,
      dateCreated: publishedAt,
      author: {
        '@type': 'Person',
        name: questioneer,
        url: pageUrl,
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
          url: aboutUrl,
        },
      },
      ...(suggestedAnswers.length > 0 && { suggestedAnswer: suggestedAnswers }),
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
          
          <div className="flex flex-wrap items-center text-muted-foreground mb-4 text-sm gap-2">
            <span>נשאל על ידי: {questioneer}</span>
            <span>•</span>
            <span>{formatDate(publishedAt)}</span>
          </div>
          
          {categories && categories.length > 0 && (
            <div className="mb-4">
              <FullCategoryList categories={categories} />
            </div>
          )}
          
          <div className="prose prose-lg max-w-none dark:prose-invert bg-muted dark:bg-card p-6 rounded-lg text-justify">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

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
