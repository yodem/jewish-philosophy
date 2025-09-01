import { formatDate } from "@/lib/date-utils";
import ReplyButton from "./ReplyButton";

interface CommentHeaderProps {
  answerer: string;
  createdAt: string;
  slug: string;
  isReplyActive: boolean;
  onReply: (slug: string) => void;
  className?: string;
}

export default function CommentHeader({
  answerer,
  createdAt,
  slug,
  isReplyActive,
  onReply,
  className = ""
}: CommentHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div className="flex items-center text-gray-500 text-sm">
        <span className="font-medium">{answerer}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(createdAt)}</span>
      </div>
      <ReplyButton
        slug={slug}
        isActive={isReplyActive}
        onReply={onReply}
      />
    </div>
  );
}
