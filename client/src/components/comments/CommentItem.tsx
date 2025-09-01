import { Comment as CommentType } from "@/types";
import { CommentType as CommentTypeEnum } from "@/constants/comments";
import CommentHeader from "./CommentHeader";
import CommentContent from "./CommentContent";
import ThreadItem from "./ThreadItem";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: CommentType;
  responsaSlug?: string;
  blogSlug?: string;
  commentType: CommentTypeEnum;
  replyingTo: string | null;
  onReply: (slug: string) => void;
  onCancel: () => void;
  onThreadAdded: () => void;
}

export default function CommentItem({
  comment,
  responsaSlug,
  blogSlug,
  commentType,
  replyingTo,
  onReply,
  onCancel,
  onThreadAdded
}: CommentItemProps) {
  const isReplyActive = replyingTo === comment.slug;
  
  
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <CommentHeader
          answerer={comment.answerer}
          createdAt={comment.createdAt}
          slug={comment.slug}
          isReplyActive={isReplyActive}
          onReply={onReply}
          className="mb-4"
        />
        
        <CommentContent
          content={comment.answer}
          size="md"
          className="mb-4"
        />
        
        {/* Reply form */}
        {isReplyActive && (
          <div className="mt-4 mr-8 border-r-2 border-blue-200 pr-4 animate-in slide-in-from-top-2 duration-200">
            <CommentForm
              responsaSlug={responsaSlug}
              blogSlug={blogSlug}
              onCommentAdded={onThreadAdded}
              commentType={commentType}
              parentCommentSlug={comment.slug}
              isThread={true}
              onCancel={onCancel}
              isOpen={true}
            />
          </div>
        )}
      </div>
      
      {/* Render threads */}
      {comment.threads && comment.threads.length > 0 && (
        <div className="mr-8 space-y-3">
          {comment.threads.map((thread) => (
            <ThreadItem
              key={thread.id}
              parentComment={comment.slug}
              thread={thread}
              responsaSlug={responsaSlug}
              blogSlug={blogSlug}
              commentType={commentType}
              replyingTo={replyingTo}
              onReply={onReply}
              onCancel={onCancel}
              onThreadAdded={onThreadAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
