"use client";

import React, { useState } from "react";
import { Comment as CommentType } from "@/types";
import { CommentType as CommentTypeEnum, COMMENT_LABELS } from "@/constants/comments";
import { CommentItem } from ".";

interface CommentsListProps {
  comments: CommentType[];
  commentType?: CommentTypeEnum;
  responsaSlug?: string;
  blogSlug?: string;
  onCommentAdded?: () => void;
}

export default function CommentsList({
  comments,
  commentType = 'responsa',
  responsaSlug,
  blogSlug,
  onCommentAdded
}: CommentsListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleReply = (commentSlug: string) => {
    // Toggle reply form: close if same button, open if different
    setReplyingTo(replyingTo === commentSlug ? null : commentSlug);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleThreadAdded = () => {
    setReplyingTo(null);
    onCommentAdded?.();
  };

  const currentLabels = COMMENT_LABELS[commentType];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        {currentLabels.sectionTitle} ({comments?.length || 0})
      </h2>
      
      {comments && comments.length > 0 ? (
        <div className="space-y-8">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              responsaSlug={responsaSlug}
              blogSlug={blogSlug}
              commentType={commentType}
              replyingTo={replyingTo}
              onReply={handleReply}
              onCancel={handleCancelReply}
              onThreadAdded={handleThreadAdded}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-8">{currentLabels.noCommentsText}</p>
      )}
    </div>
  );
}
