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
    <div className={`${sizeClasses[size]} dark:prose-invert text-justify ${className}`}>
      <ReactMarkdown
        components={{
          a: ({ children, href }) => {
            return <span className="flex"><Link href={href || '/'}><span>{children}</span></Link></span>
          }
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
