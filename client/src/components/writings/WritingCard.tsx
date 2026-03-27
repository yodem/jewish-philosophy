import Link from "next/link";
import { LimitedCategoryList } from "@/components/shared/LimitedCategoryList";
import { Writing } from "@/types";

interface WritingCardProps {
  writing: Writing;
  className?: string;
}

export default function WritingCard({ writing, className }: WritingCardProps) {
  const isBook = writing.type === 'book';

  return (
    <Link
      href={`/writings/${writing.slug}`}
      className={`block bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow duration-150 ${className || ""}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
          isBook
            ? 'bg-ct-video/15 text-ct-video'
            : 'bg-ct-writing/15 text-ct-writing'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isBook ? (
              <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>
            ) : (
              <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></>
            )}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
            {writing.title}
          </h3>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
            isBook
              ? 'bg-ct-video/15 text-ct-video'
              : 'bg-ct-writing/15 text-ct-writing'
          }`}>
            {isBook ? 'ספר' : 'מאמר'}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {writing.author.name}
      </p>

      {writing.categories && writing.categories.length > 0 && (
        <LimitedCategoryList categories={writing.categories} />
      )}
    </Link>
  );
}
