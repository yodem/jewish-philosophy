"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Comment as CommentType } from "@/types";
import CommentsList from "./comments/CommentsList";
import CommentForm from "./comments/CommentForm";

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

  // Sync comments with initialComments when they change (for new refresh pattern)
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Callback to refresh comments after comment submission
  const handleCommentAdded = useCallback(async () => {
    if (onCommentsRefresh) {
      try {
        // Check if it's the new refresh function (no parameters) or legacy (with slug)
        if (onCommentsRefresh.length === 0) {
          // New refresh function that handles its own state update
          await (onCommentsRefresh as () => Promise<void>)();
        } else {
          // Legacy refresh function that returns comments
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
