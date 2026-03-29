import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface LimitedCategoryListProps {
  categories?: Category[];
  maxDisplay?: number;
  className?: string;
  isSelectable?: boolean;
  forceColorClass?: string;
}

export function LimitedCategoryList({
  categories = [],
  maxDisplay = 2,
  className,
  isSelectable = false,
  forceColorClass,
}: LimitedCategoryListProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const displayedCategories = categories.slice(0, maxDisplay);
  const remainingCount = categories.length - maxDisplay;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayedCategories.map((category) => (
        <CategoryBadge
          key={category.id}
          category={category}
          isSelectable={isSelectable}
          forceColorClass={forceColorClass}
        />
      ))}

      {remainingCount > 0 && (
        <div className="inline-flex items-center px-2 py-1 text-xs font-medium bg-muted text-muted-foreground dark:bg-card dark:text-muted-foreground rounded-md">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

interface FullCategoryListProps {
  categories?: Category[];
  className?: string;
  isSelectable?: boolean;
  forceColorClass?: string;
}

export function FullCategoryList({
  categories = [],
  className,
  isSelectable = false,
  forceColorClass,
}: FullCategoryListProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {categories.map((category) => (
        <CategoryBadge
          key={category.id}
          category={category}
          isSelectable={isSelectable}
          forceColorClass={forceColorClass}
        />
      ))}
    </div>
  );
}

export default LimitedCategoryList;
