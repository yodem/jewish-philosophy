import { Badge } from "@/components/ui/badge";
import { Category } from "@/types";
import React from "react";


// Define category-specific background colors (each category gets its own unique color)
export const CATEGORY_BACKGROUNDS: Record<string, string> = {
  // Terms - Blue/Purple spectrum
  "soul": "bg-blue-600 text-white",
  "god": "bg-blue-700 text-white",
  "evil": "bg-blue-800 text-white",
  "mind": "bg-indigo-600 text-white",
  "family": "bg-indigo-700 text-white",
  "free-will": "bg-indigo-800 text-white",
  "messiah": "bg-purple-600 text-white",
  "kabalah": "bg-purple-700 text-white",
  "yetzer-hara": "bg-purple-800 text-white",
  "pure": "bg-violet-600 text-white",

  // Persons - Amber/Orange spectrum
  "aristotle": "bg-amber-600 text-white",
  "mimonidies": "bg-amber-700 text-white",
  "hazal": "bg-amber-800 text-white",
  "ibn-sina": "bg-orange-600 text-white",
  "ibn-ezra": "bg-orange-700 text-white",
  "al-phiumi": "bg-orange-800 text-white",
  "rabi-yehuda-halevi": "bg-red-600 text-white",
  "spinoza": "bg-red-700 text-white",
  "rabi-moshe-narbon": "bg-red-800 text-white",
  "rasag": "bg-pink-600 text-white",
  "philon": "bg-pink-700 text-white",
  "ibn-gvirol": "bg-pink-800 text-white",
  "plato": "bg-rose-600 text-white",

  // Genres - Yellow/Green spectrum
  "aristotelianism": "bg-yellow-600 text-white",
  "platonism": "bg-yellow-700 text-white",
  "metaphysics": "bg-yellow-800 text-white",
  "materialism": "bg-lime-600 text-white",
  "ontology": "bg-lime-700 text-white",
  "epistemology": "bg-green-600 text-white",

  // General
  "general": "bg-gray-600 text-white",
};

// Define border colors based on category type
export const TYPE_COLORS: Record<string, string> = {
  term: "border-indigo-500",
  person: "border-amber-500",
  genre: "border-yellow-500",
  general: "border-gray-500",
};

// Helper function to get category color class based on category slug and type
function getCategoryColorClass(category: Category): string {
  const { slug, type } = category;

  // Get background color based on specific category slug
  const background = CATEGORY_BACKGROUNDS[slug] || CATEGORY_BACKGROUNDS['general'];

  // Get border color based on type
  const border = TYPE_COLORS[type || 'general'] || TYPE_COLORS['general'];

  // Return combined classes
  return `${background} ${border}`;
}

// Define colors for content types
export const CONTENT_TYPE_COLORS: Record<string, string> = {
  all: "bg-gray-600 border-gray-500 text-white",
  blog: "bg-blue-500 border-blue-400 text-white",
  video: "bg-red-500 border-red-400 text-white",
  playlist: "bg-green-500 border-green-400 text-white",
  responsa: "bg-purple-500 border-purple-400 text-white",
  writing: "bg-orange-500 border-orange-400 text-white",
  term: "bg-indigo-500 border-indigo-400 text-white",
  person: "bg-amber-500 border-amber-400 text-white",
  genre: "bg-yellow-500 border-yellow-400 text-white",
  general: "bg-gray-500 border-gray-400 text-white",
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