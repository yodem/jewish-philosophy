"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";

interface BlogContentWrapperProps {
  content: string;
  className?: string;
}

/**
 * Rich text content wrapper using @tailwindcss/typography prose classes.
 * Renders markdown content with GFM support and raw HTML passthrough.
 */
export default function BlogContentWrapper({
  content,
  className = "prose prose-lg max-w-none dark:prose-invert text-justify overflow-hidden break-words"
}: BlogContentWrapperProps) {
  return (
    <article className={className}>
      <ReactMarkdown
        components={{
          a: ({ children, href }) => {
            return <Link href={href || '#'}><span>{children}</span></Link>;
          }
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
