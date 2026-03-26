"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getResponsaBySlug } from "@/data/loaders";
import { Comment as CommentType } from "@/types";
import CommentSection from "@/components/comments/CommentSection";
import SefariaLinker from "@/components/shared/SefariaLinker";
import { trackContentView } from "@/lib/analytics";

interface ResponsaCommentWrapperProps {
  initialComments: CommentType[];
  responsaSlug: string;
  slug: string;
  responsaTitle: string;
}

export default function ResponsaCommentWrapper({
  initialComments,
  responsaSlug,
  slug,
  responsaTitle
}: ResponsaCommentWrapperProps) {
  const [commentsData, setCommentsData] = useState<CommentType[]>(initialComments);

  const refreshComments = useCallback(async () => {
    try {
      const data = await getResponsaBySlug(slug);
      if (data) {
        setCommentsData(data.comments || []);
      }
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }
  }, [slug]);

  useEffect(() => {
    trackContentView(responsaTitle, 'responsa', 'שלום צדיק');
  }, [responsaTitle]);

  useEffect(() => {
    setCommentsData(initialComments);
  }, [initialComments]);

  return (
    <>
      <CommentSection
        initialComments={commentsData}
        responsaSlug={responsaSlug}
        commentType="responsa"
        onCommentsRefresh={refreshComments}
      />
      <SefariaLinker reRunDeps={[commentsData]} />
    </>
  );
}
