import ReactMarkdown from "react-markdown";
import Link from "next/link";

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
    <div className={`${sizeClasses[size]} dark:prose-invert text-justify break-words overflow-wrap-anywhere ${className}`}>
      <ReactMarkdown
        components={{
          a: ({ children, href }) => {
            return <Link href={href || '/'}><span>{children}</span></Link>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
