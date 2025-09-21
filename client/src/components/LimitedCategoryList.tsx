import { CategoryBadge } from "@/components/CategoryBadge";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface LimitedCategoryListProps {
  categories?: Category[];
  maxDisplay?: number;
  className?: string;
  isSelectable?: boolean;
}

export function LimitedCategoryList({
  categories = [],
  maxDisplay = 2,
  className,
  isSelectable = false
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
        />
      ))}

      {remainingCount > 0 && (
        <div className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md">
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
}

export function FullCategoryList({
  categories = [],
  className,
  isSelectable = false
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
        />
      ))}
    </div>
  );
}

export default LimitedCategoryList;
