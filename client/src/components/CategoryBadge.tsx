import { Badge } from "@/components/ui/badge";
import { Category } from "@/types";
import React from "react";

// Define the color mapping for categories
export const CATEGORY_COLORS: Record<string, string> = {
  philosophy: "bg-blue-600 text-white dark:bg-blue-700",
  // Add more categories here as needed
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
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  contentType, 
  label,
  className,
  variant = "default",
  onClick
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

  return (
    <Badge 
      className={`${finalClassName} ${onClick ? 'cursor-pointer' : ''}`.trim()}
      variant={variant}
      onClick={onClick}
    >
      {displayLabel}
    </Badge>
  );
};

export default CategoryBadge; 