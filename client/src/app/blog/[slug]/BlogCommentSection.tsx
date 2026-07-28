"use client";

import React, { useCallback } from "react";
import { Comment as CommentType } from "@/types";
import CommentSection from "@/components/comments/CommentSection";

interface BlogCommentSectionProps {
  initialComments: CommentType[];
  blogSlug: string;
}

export default function BlogCommentSection({
  initialComments,
  blogSlug
}: BlogCommentSectionProps) {
  const refreshComments = useCallback(async (slug: string) => {
    const response = await fetch(`/api/blog-comments?slug=${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error('Failed to fetch blog comments');
    return await response.json();
  }, []);

  return (
    <CommentSection
      initialComments={initialComments}
      blogSlug={blogSlug}
      commentType="blog"
      onCommentsRefresh={refreshComments}
    />
  );
}
