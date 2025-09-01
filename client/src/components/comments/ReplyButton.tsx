import { Button } from "@/components/ui/button";
import { REPLY_BUTTON_LABELS } from "@/constants/comments";

interface ReplyButtonProps {
  slug: string;
  isActive: boolean;
  onReply: (slug: string) => void;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function ReplyButton({
  slug,
  isActive,
  onReply,
  size = "sm",
  className = ""
}: ReplyButtonProps) {
  const baseClassName = `text-xs ${
    isActive
      ? "text-blue-800 bg-blue-50"
      : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
  }`;

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={() => onReply(slug)}
      className={`${baseClassName} ${className}`}
    >
      {isActive ? REPLY_BUTTON_LABELS.cancel : REPLY_BUTTON_LABELS.reply}
    </Button>
  );
}
