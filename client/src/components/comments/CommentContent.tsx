import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CommentContentProps {
  content: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CommentContent({
  content,
  size = "md",
  className = ""
}: CommentContentProps) {
  const sizeClasses = {
    sm: "prose prose-sm",
    md: "prose prose-md", 
    lg: "prose prose-lg"
  };

  return (
    <div className={`${sizeClasses[size]} dark:prose-invert text-justify overflow-hidden overflow-wrap-anywhere ${className}`}>
      <ReactMarkdown
        components={{
          a: ({ children, href }) => {
            return <Link href={href || ''} className="block mt-1 break-all">{children}</Link>
          }
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
