"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getResponsaBySlug } from "@/data/loaders";
import { Comment as CommentType } from "@/types";
import CommentSection from "@/components/CommentSection";
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

  // Refresh comments by re-fetching the responsa with populated comments
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

  // Track responsa view when component mounts (client-side analytics)
  useEffect(() => {
    trackContentView(responsaTitle, 'responsa', 'שלום צדיק');
  }, [responsaTitle]);

  // Sync with initial comments when they change
  useEffect(() => {
    setCommentsData(initialComments);
  }, [initialComments]);

  return (
    <CommentSection 
      initialComments={commentsData}
      responsaSlug={responsaSlug}
      commentType="responsa"
      onCommentsRefresh={refreshComments}
    />
  );
}
