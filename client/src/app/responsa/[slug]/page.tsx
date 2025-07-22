"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { getResponsaBySlug } from "@/data/loaders";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Comment as CommentType, Category, Responsa } from "@/types";
import CommentForm from "./CommentForm";

export default function ResponsaPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [responsa, setResponsa] = useState<Responsa | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResponsa() {
      try {
        const data = await getResponsaBySlug(slug);
        setResponsa(data);
      } catch (error) {
        console.error("Error loading responsa:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadResponsa();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>טוען...</p>
      </div>
    );
  }

  if (!responsa) {
    notFound();
  }
  
  const { title, content, questioneer, publishedAt, categories, comments } = responsa;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <Breadcrumbs items={[
        { label: 'בית', href: '/' },
        { label: 'שו״ת', href: '/responsa' },
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
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category: Category) => (
                <CategoryBadge key={category.id} category={category} />
              ))}
            </div>
          )}
          
          <div className="prose prose-lg max-w-none dark:prose-invert bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">תשובות ({comments?.length || 0})</h2>
          
          {comments && comments.length > 0 ? (
            <div className="space-y-8">
              {comments.map((comment: CommentType) => (
                <div key={comment.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center text-gray-500 mb-4 text-sm">
                    <span className="font-medium">{comment.answerer}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="prose prose-md dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: comment.answer }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-8">אין תשובות עדיין. היה הראשון להשיב!</p>
          )}
          
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-4">הוסף תשובה</h3>
            <CommentForm responsaId={responsa.id} />
          </div>
        </div>
      </div>
    </div>
  );
} 