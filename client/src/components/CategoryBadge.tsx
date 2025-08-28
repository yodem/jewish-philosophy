import { Badge } from "@/components/ui/badge";
import { Category } from "@/types";
import React from "react";

// Define the color mapping for categories
export const CATEGORY_COLORS: Record<string, string> = {
  philosophy: "bg-blue-600 text-white dark:bg-blue-700",
  evil: "bg-red-700 text-white dark:bg-red-800",
  religion: "bg-yellow-600 text-white dark:bg-yellow-700",
  soul: "bg-indigo-600 text-white dark:bg-indigo-700",
  mimonidies: "bg-green-700 text-white dark:bg-green-800",
  hazal: "bg-pink-700 text-white dark:bg-pink-800",
  family: "bg-teal-700 text-white dark:bg-teal-800",
  torah: "bg-purple-700 text-white dark:bg-purple-800",
  "free-will": "bg-orange-600 text-white dark:bg-orange-700",
  mind: "bg-cyan-700 text-white dark:bg-cyan-800",
  aristotle: "bg-lime-700 text-white dark:bg-lime-800",
  god: "bg-blue-400 text-white dark:from-blue-800",
};

// Define colors for content types
export const CONTENT_TYPE_COLORS: Record<string, string> = {
  all: "bg-gray-600 text-white dark:bg-gray-700",
  blog: "bg-blue-500 text-white dark:bg-blue-600",
  video: "bg-red-500 text-white dark:bg-red-600", 
  playlist: "bg-green-500 text-white dark:bg-green-600",
  responsa: "bg-purple-500 text-white dark:bg-purple-600",
  writing: "bg-orange-500 text-white dark:bg-orange-600",
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
    colorClass = CATEGORY_COLORS[category.slug] || "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
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