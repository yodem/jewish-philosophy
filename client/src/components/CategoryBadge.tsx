import { Badge } from "@/components/ui/badge";
import { Category } from "@/types";
import React from "react";


// Define category-specific background colors (large variety across all categories)
export const CATEGORY_BACKGROUNDS: Record<string, string> = {
  // Diverse color palette for all categories
  "soul": "bg-blue-600 text-white",
  "aristotelianism": "bg-amber-700 text-white",
  "general": "bg-gray-400 text-white",
  "evil": "bg-teal-600 text-white",
  "aristotle": "bg-amber-600 text-white",
  "mimonidies": "bg-orange-600 text-white",
  "mind": "bg-indigo-600 text-white",
  "family": "bg-purple-600 text-white",
  "hazal": "bg-yellow-600 text-white",
  "free-will": "bg-violet-600 text-white",
  "messiah": "bg-fuchsia-600 text-white",
  "ibn-sina": "bg-lime-600 text-white",
  "ibn-ezra": "bg-green-600 text-white",
  "al-phiumi": "bg-emerald-600 text-white",
  "rabi-yehuda-halevi": "bg-blue-700 text-white",
  "spinoza": "bg-cyan-700 text-white",
  "rabi-moshe-narbon": "bg-teal-700 text-white",
  "kabalah": "bg-pink-600 text-white",
  "plato": "bg-fuchsia-700 text-white",
  "yetzer-hara": "bg-rose-600 text-white",
  "platonism": "bg-orange-700 text-white",
  "rasag": "bg-indigo-700 text-white",
  "philon": "bg-purple-700 text-white",
  "pure": "bg-red-600 text-white",
  "ibn-gvirol": "bg-violet-700 text-white",
  "materialism": "bg-lime-700 text-white",
  "god": "bg-cyan-600 text-white",
  "ibn-rushd": "bg-pink-700 text-white",
  "crescas": "bg-rose-700 text-white",
  "ralbag": "bg-blue-800 text-white",
  "rabbi-abraham-bar-hiya": "bg-amber-800 text-white",
  "rabbi-levi-ben-abraham": "bg-lime-800 text-white",
  "rabbi-nissim-marsei": "bg-green-800 text-white",
  "rabbi-yitzhak-polker": "bg-emerald-800 text-white",
  "rabbi-joseph-albo": "bg-cyan-800 text-white",
  "reform": "bg-red-700 text-white",
  "avner-from-burgus": "bg-fuchsia-800 text-white",
  "determinism": "bg-violet-800 text-white",
  "rabbi-ibn-galquera": "bg-yellow-800 text-white",
  "Haran": "bg-orange-800 text-white",
  "rabbi-joseph-ibn-caspi": "bg-pink-800 text-white",
  "Rabbi-Aaron-son-of-Elijah-of-Nicomedia": "bg-rose-800 text-white",
  "rabbi-abraham-ibn-daud": "bg-blue-900 text-white",
  "rabbi-hoter-ben-shelomo": "bg-amber-900 text-white",
  "new-platonism": "bg-lime-900 text-white",
  "rabbi-abraham-bibago": "bg-green-900 text-white",
};

// Helper function to get category color class based on category slug
function getCategoryColorClass(category: Category): string {
  const { slug } = category;

  // Get background color based on specific category slug
  return CATEGORY_BACKGROUNDS[slug] || CATEGORY_BACKGROUNDS['general'];
}

// Define colors for content types
export const CONTENT_TYPE_COLORS: Record<string, string> = {
  all: "bg-gray-600 text-white",
  blog: "bg-blue-500 text-white",
  video: "bg-red-500 text-white",
  playlist: "bg-green-500 text-white",
  responsa: "bg-purple-500 text-white",
  writing: "bg-orange-500 text-white",
  term: "bg-indigo-500 text-white",
  person: "bg-amber-500 text-white",
  genre: "bg-yellow-500 text-white",
  general: "bg-gray-500 text-white",
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
    colorClass = CONTENT_TYPE_COLORS[contentType] || "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
    displayLabel = label || contentType;
  } else if (label) {
    colorClass = "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
    displayLabel = label;
  }

  // If variant is outline, don't use the color class
  const finalClassName = variant === "outline"
    ? className
    : `${colorClass} ${className || ""}`.trim();

  // Add selection and disabled states
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
        ${onClick ? '' : ''}
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