import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LimitedCategoryList } from "@/components/shared/LimitedCategoryList";
import { Term } from "@/types";

interface TermCardProps {
  term: Term;
  className?: string;
}

export default function TermCard({ term, className }: TermCardProps) {
  return (
    <Link href={`/terms/${term.slug}`}>
      <Card
        className={`h-full flex flex-col bg-card border-border hover:shadow-md hover:border-ct-term/40 transition-shadow duration-150 cursor-pointer overflow-hidden ${className || ""}`}
      >
        {/* Pink accent bar at top */}
        <div className="h-1 w-full bg-ct-term" />

        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="text-xl font-bold text-right leading-tight line-clamp-2 text-foreground">
            {term.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col pt-0">
          <p className="text-sm text-muted-foreground text-right mb-4 leading-relaxed line-clamp-3 flex-grow">
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
