import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LimitedCategoryList } from "@/components/shared/LimitedCategoryList";
import { Term } from "@/types";
import { BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

interface TermCardProps {
  term: Term;
  className?: string;
}

export default function TermCard({ term, className }: TermCardProps) {
  return (
    <Link href={`/terms/${term.slug}`} className="h-full block group outline-none">
      <Card
        className={cn(
          "h-full flex flex-col bg-card border-border/60 hover:shadow-md hover:border-ct-term/40 transition-all duration-200 overflow-hidden relative",
          className
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-ct-term/70 group-hover:bg-ct-term transition-colors duration-300" />
        
        <CardContent className="flex-grow flex flex-col p-6 pt-7">
          <div className="flex justify-between items-start mb-4 gap-4">
            {term.categories && term.categories.length > 0 ? (
              <LimitedCategoryList 
                categories={term.categories} 
                maxDisplay={1} 
                isSelectable={false} 
              />
            ) : <div />}
            
            <div className="bg-ct-term/10 text-ct-term/90 border border-ct-term/20 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 shrink-0 uppercase tracking-wider">
              <BookMarked className="size-3" />
              מושג
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-ct-term transition-colors">
            {term.title}
          </h3>
          
          <p className="text-sm text-muted-foreground text-justify leading-relaxed line-clamp-4 flex-grow">
            {term.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
