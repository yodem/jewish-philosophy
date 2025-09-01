"use client";

import React, { useState, useCallback } from "react";
import { Comment as CommentType } from "@/types";
import { CommentType as CommentTypeEnum } from "@/constants/comments";
import CommentsList from "./CommentsList";
import CommentForm from "./CommentForm";

interface CommentSectionProps {
  initialComments: CommentType[];
  responsaSlug?: string;
  blogSlug?: string;
  commentType?: CommentTypeEnum;
  onCommentsRefresh?: (slug: string) => Promise<CommentType[]>;
}

export default function CommentSection({
  initialComments,
  responsaSlug,
  blogSlug,
  commentType = 'responsa',
  onCommentsRefresh
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);

  const handleCommentAdded = useCallback(async () => {
    if (onCommentsRefresh) {
      const slug = responsaSlug || blogSlug;
      if (slug) {
        try {
          const updatedComments = await onCommentsRefresh(slug);
          setComments(updatedComments);
        } catch (error) {
          console.error("Error refreshing comments:", error);
        }
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
