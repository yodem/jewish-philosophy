import { Thread } from "@/types";
import { CommentType } from "@/constants/comments";
import CommentHeader from "./CommentHeader";
import CommentContent from "./CommentContent";
import CommentForm from "./CommentForm";

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
