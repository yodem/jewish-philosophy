"use client";

import React from "react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { FullCategoryList } from "@/components/shared/LimitedCategoryList";
import { Responsa, Comment } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ViewCountTracker from "@/components/shared/ViewCountTracker";
import ResponsaCommentWrapper from "./ResponsaCommentWrapper";

interface ResponsaPageClientProps {
  responsa: Responsa;
  slug: string;
}

export default function ResponsaPageClient({ responsa, slug }: ResponsaPageClientProps) {
  const { title, content, questioneer, publishedAt, categories } = responsa;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {responsa && <ViewCountTracker contentType="responsas" contentId={responsa.id.toString()} />}
      <Breadcrumbs items={[
        { label: "בית", href: "/" },
        { label: "שו״ת", href: "/responsa" },
        { label: title }
      ]} />

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-foreground">{title}</h1>

          <div className="flex flex-wrap items-center text-muted-foreground mb-4 text-sm gap-2">
            <span>נשאל על ידי: {questioneer}</span>
            <span>&#x2022;</span>
            <span>{formatDate(publishedAt)}</span>
          </div>

          {categories && categories.length > 0 && (
            <div className="mb-4">
              <FullCategoryList categories={categories} />
            </div>
          )}

          <div className="prose prose-lg max-w-none dark:prose-invert bg-muted dark:bg-card p-6 rounded-lg text-justify overflow-hidden">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
