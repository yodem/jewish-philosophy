import { Thread } from "@/types";
import { CommentType } from "@/constants/comments";
import CommentHeader from "./CommentHeader";
import CommentContent from "./CommentContent";
import CommentForm from "./CommentForm";
import Link from "next/link";

interface ThreadItemProps {
  thread: Thread;
  level?: number;
  responsaSlug?: string;
  blogSlug?: string;
  commentType: CommentType;
  parentComment: string;
  replyingTo: string | null;
  onReply: (slug: string) => void;
  onCancel: () => void;
  onThreadAdded: () => void;
}

export default function ThreadItem({
  thread,
  level = 1,
  responsaSlug,
  blogSlug,
  commentType,
  replyingTo,
  parentComment,
  onReply,
  onCancel,
  onThreadAdded
}: ThreadItemProps) {
  const isReplyActive = replyingTo === thread.slug;

  return (
    <div
      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm"
      style={{ marginLeft: `${level * 20}px` }}
    >
      <CommentHeader
        answerer={thread.answerer}
        createdAt={thread.createdAt}
        slug={thread.slug}
        isReplyActive={isReplyActive}
        onReply={onReply}
        className="mb-3"
      />
      
      <CommentContent
        content={thread.answer}
        size="sm"
        className="mb-3"
      />

      {/* Related writings */}
      {thread.writings && thread.writings.length > 0 && (
        <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-600 rounded-md">
          <h5 className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            כתבים קשורים:
          </h5>
          <div className="flex flex-wrap gap-1">
            {thread.writings.map((writing) => (
              <Link
                key={writing.id}
                href={`/writings/${writing.slug}`}
                className="inline-block px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 rounded-full transition-colors duration-200"
              >
                {writing.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reply form for thread */}
      {isReplyActive && (
        <div className="mt-3 ml-4 border-r-2 border-blue-200 pr-3 animate-in slide-in-from-top-2 duration-200">
          <CommentForm
            responsaSlug={responsaSlug}
            blogSlug={blogSlug}
            onCommentAdded={onThreadAdded}
            commentType={commentType}
            parentCommentSlug={parentComment}
            isThread={true}
            onCancel={onCancel}
            isOpen={true}
          />
        </div>
      )}
    </div>
  );
}
