"use client";

import React from "react";
import { Comment as CommentType } from "@/types";
import ReactMarkdown from "react-markdown";

interface CommentsListProps {
  comments: CommentType[];
  commentType?: 'responsa' | 'blog';
}

export default function CommentsList({ 
  comments, 
  commentType = 'responsa' 
}: CommentsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const labels = {
    responsa: {
      sectionTitle: "תשובות",
      noCommentsText: "אין תשובות עדיין. היה הראשון להשיב!",
    },
    blog: {
      sectionTitle: "תגובות",
      noCommentsText: "אין תגובות עדיין. היה הראשון להגיב!",
    }
  };

  const currentLabels = labels[commentType];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        {currentLabels.sectionTitle} ({comments?.length || 0})
      </h2>
      
      {comments && comments.length > 0 ? (
        <div className="space-y-8">
          {comments.map((comment: CommentType) => (
            <div key={comment.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex items-center text-gray-500 mb-4 text-sm">
                <span className="font-medium">{comment.answerer}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(comment.createdAt)}</span>
              </div>
              <div className="prose prose-md dark:prose-invert text-justify">
                <ReactMarkdown>{comment.answer}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-8">{currentLabels.noCommentsText}</p>
      )}
    </div>
  );
}
