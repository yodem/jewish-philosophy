"use client";

import React from "react";
import { Comment as CommentType } from "@/types";
import CommentSection from "@/components/CommentSection";
import { getBlogCommentsBySlug } from "@/data/loaders";

interface BlogCommentSectionProps {
  initialComments: CommentType[];
  blogSlug: string;
}

export default function BlogCommentSection({ 
  initialComments,
  blogSlug
}: BlogCommentSectionProps) {
  return (
    <CommentSection 
      initialComments={initialComments}
      blogSlug={blogSlug}
      commentType="blog"
      onCommentsRefresh={getBlogCommentsBySlug}
    />
  );
}
