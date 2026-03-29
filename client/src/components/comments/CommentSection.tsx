"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Comment as CommentType } from "@/types";
import CommentsList from "./CommentsList";
import CommentForm from "./CommentForm";

interface CommentSectionProps {
  initialComments: CommentType[];
  responsaSlug?: string;
  blogSlug?: string;
  commentType?: 'responsa' | 'blog';
  onCommentsRefresh?: (() => Promise<void>) | ((slug: string) => Promise<CommentType[]>);
}

export default function CommentSection({
  initialComments,
  responsaSlug,
  blogSlug,
  commentType = 'responsa',
  onCommentsRefresh
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleCommentAdded = useCallback(async () => {
    if (onCommentsRefresh) {
      try {
        if (onCommentsRefresh.length === 0) {
          await (onCommentsRefresh as () => Promise<void>)();
        } else {
          const slug = responsaSlug || blogSlug;
          if (slug) {
            const updatedComments = await (onCommentsRefresh as (slug: string) => Promise<CommentType[]>)(slug);
            setComments(updatedComments);
          }
        }
      } catch (error) {
        console.error("Error refreshing comments:", error);
      }
    }
  }, [responsaSlug, blogSlug, onCommentsRefresh]);

  return (
    <>
      <CommentsList
        comments={comments}
        commentType={commentType}
        responsaSlug={responsaSlug}
        blogSlug={blogSlug}
        onCommentAdded={handleCommentAdded}
      />

      <div className="mt-12">
        <CommentForm
          responsaSlug={responsaSlug}
          blogSlug={blogSlug}
          onCommentAdded={handleCommentAdded}
          commentType={commentType}
          isOpen={true}
          showHeader={true}
        />
      </div>
    </>
  );
}
