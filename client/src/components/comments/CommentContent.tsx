import ReactMarkdown from "react-markdown";
import SefariaLinker from "@/components/SefariaLinker";

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
    <>
      <div className={`${sizeClasses[size]} dark:prose-invert text-justify ${className}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      
      {/* Sefaria Linker for automatic citation linking in comments */}
      <SefariaLinker />
    </>
  );
}
