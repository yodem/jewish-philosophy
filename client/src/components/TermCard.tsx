import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LimitedCategoryList } from "@/components/LimitedCategoryList";
import { Term } from "@/types";

interface TermCardProps {
  term: Term;
  className?: string;
}

export default function TermCard({ term, className }: TermCardProps) {
  return (
    <Link href={`/terms/${term.slug}`}>
      <Card 
        className={`h-full flex flex-col bg-gradient-to-br from-white via-white to-cyan-100 dark:from-gray-900 dark:via-gray-900 dark:to-cyan-200/20 hover:shadow-xl transition-shadow duration-200 cursor-pointer ${className || ""}`}
      >
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="text-lg font-semibold text-right leading-tight line-clamp-2">
            {term.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-right mb-4 leading-relaxed line-clamp-3 flex-grow">
            {term.description}
          </p>

          {/* Categories */}
          {term.categories && term.categories.length > 0 && (
            <div className="flex justify-end">
              <LimitedCategoryList categories={term.categories} isSelectable={false} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
