"use client";

import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface BlogContentWrapperProps {
  content: string;
  className?: string;
}

export default function BlogContentWrapper({
  content,
  className = "prose prose-lg max-w-none dark:prose-invert text-justify overflow-hidden"
}: BlogContentWrapperProps) {
  return (
    <article className={className}>
      <ReactMarkdown
        components={{
          a: ({ children, href }) => {
            return <Link href={href || '#'}><span>{children}</span></Link>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
