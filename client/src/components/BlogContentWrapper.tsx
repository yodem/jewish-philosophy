"use client";

import ReactMarkdown from "react-markdown";
import SefariaLinker from "./SefariaLinker";

interface BlogContentWrapperProps {
  content: string;
  className?: string;
}

export default function BlogContentWrapper({
  content,
  className = "prose prose-lg max-w-none dark:prose-invert text-justify"
}: BlogContentWrapperProps) {
  return (
    <>
      <article className={className}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>

      {/* Sefaria Linker for automatic citation linking */}
      <SefariaLinker />
    </>
  );
}
