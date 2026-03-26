import { Badge } from "@/components/ui/badge";
import { Category } from "@/types";
import React from "react";

// Semantic category color palette - 8 palettes that work in light & dark mode
const CATEGORY_PALETTES = [
  "bg-blue-500/15 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300",
  "bg-purple-500/15 text-purple-700 dark:bg-purple-400/20 dark:text-purple-300",
  "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300",
  "bg-orange-500/15 text-orange-700 dark:bg-orange-400/20 dark:text-orange-300",
  "bg-teal-500/15 text-teal-700 dark:bg-teal-400/20 dark:text-teal-300",
  "bg-pink-500/15 text-pink-700 dark:bg-pink-400/20 dark:text-pink-300",
  "bg-amber-500/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300",
  "bg-indigo-500/15 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-300",
] as const;

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getCategoryColorClass(category: Category): string {
  const idx = hashSlug(category.slug || 'general') % CATEGORY_PALETTES.length;
  return CATEGORY_PALETTES[idx];
}

export const CONTENT_TYPE_COLORS: Record<string, string> = {
  all: "bg-muted text-muted-foreground",
  video: "bg-blue-500/15 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300",
  playlist: "bg-purple-500/15 text-purple-600 dark:bg-purple-400/20 dark:text-purple-300",
  blog: "bg-green-500/15 text-green-600 dark:bg-green-400/20 dark:text-green-300",
  responsa: "bg-orange-500/15 text-orange-600 dark:bg-orange-400/20 dark:text-orange-300",
  writing: "bg-teal-500/15 text-teal-600 dark:bg-teal-400/20 dark:text-teal-300",
  term: "bg-pink-500/15 text-pink-600 dark:bg-pink-400/20 dark:text-pink-300",
  person: "bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300",
  genre: "bg-yellow-500/15 text-yellow-600 dark:bg-yellow-400/20 dark:text-yellow-300",
  general: "bg-muted text-muted-foreground",
};

interface CategoryBadgeProps {
  category?: Category;
  contentType?: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline";
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  isSelectable?: boolean;
  showRemoveIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  contentType,
  label,
  className,
  variant = "default",
  onClick,
  isSelected = false,
  isDisabled = false,
  isSelectable = true,
  showRemoveIcon = false
}) => {
  let colorClass = "";
  let displayLabel = "";

  if (category) {
    colorClass = getCategoryColorClass(category);
    displayLabel = category.name;
  } else if (contentType) {
    colorClass = CONTENT_TYPE_COLORS[contentType] || "bg-muted text-foreground dark:bg-secondary dark:text-foreground";
    displayLabel = label || contentType;
  } else if (label) {
    colorClass = "bg-muted text-foreground dark:bg-secondary dark:text-foreground";
    displayLabel = label;
  }

  const finalClassName = variant === "outline"
    ? className
    : `${colorClass} ${className || ""}`.trim();

  const selectionClass = isSelected
    ? 'ring-2 ring-primary/20 shadow-md'
    : '';

  const disabledClass = isDisabled
    ? 'opacity-50 cursor-not-allowed'
    : isSelectable
    ? 'cursor-pointer hover:scale-105 transition-transform duration-200'
    : '';

  return (
    <Badge
      className={`
        ${finalClassName}
        ${selectionClass}
        ${disabledClass}
        inline-flex items-center gap-2 text-sm
      `.trim()}
      variant={variant}
      onClick={isDisabled ? undefined : onClick}
    >
      <span>{displayLabel}</span>
      {isSelected && showRemoveIcon && (
        <svg
          className="w-4 h-4 hover:scale-125 transition-transform duration-200"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </Badge>
  );
};

export default CategoryBadge;
