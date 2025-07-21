import { Badge } from "@/components/ui/badge";
import { Category } from "@/types";
import React from "react";

// Define the color mapping for categories
export const CATEGORY_COLORS: Record<string, string> = {
  philosophy: "bg-blue-600 text-white dark:bg-blue-700",
  // Add more categories here as needed
};

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className }) => {
  const colorClass = CATEGORY_COLORS[category.slug] || "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
  return (
    <Badge className={`${colorClass} ${className || ""}`.trim()}>
      {category.name}
    </Badge>
  );
};

export default CategoryBadge; 