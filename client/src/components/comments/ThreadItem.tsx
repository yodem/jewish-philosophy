import { Thread } from "@/types";
import { CommentType } from "@/constants/comments";
import CommentHeader from "./CommentHeader";
import CommentContent from "./CommentContent";
import CommentForm from "./CommentForm";
import ContentChip from "../ContentChip";

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

      {/* Related content */}
      {((thread.writings && thread.writings.length > 0) || 
        (thread.videos && thread.videos.length > 0) || 
        (thread.responsas && thread.responsas.length > 0)) && (
        <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-600 rounded-md">
          <h5 className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            תוכן קשור:
          </h5>
          <div className="flex flex-wrap gap-1">
            {thread.writings?.map((writing) => (
              <ContentChip
                key={`writing-${writing.id}`}
                content={writing}
                type="writing"
                size="sm"
              />
            ))}
            {thread.videos?.map((video) => (
              <ContentChip
                key={`video-${video.id}`}
                content={video}
                type="video"
                size="sm"
              />
            ))}
            {thread.responsas?.map((responsa) => (
              <ContentChip
                key={`responsa-${responsa.id}`}
                content={responsa}
                type="responsa"
                size="sm"
              />
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
