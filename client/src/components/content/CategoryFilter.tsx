'use client';

import React from 'react';
import { CategoryBadge } from './CategoryBadge';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categorySlug: string) => void;
  className?: string;
  showAllOption?: boolean;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onCategoryChange,
  className,
  showAllOption = true,
}: CategoryFilterProps) {
  const isAllSelected = selectedCategories.includes('all') || selectedCategories.length === 0;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {showAllOption && (
        <CategoryBadge
          label="הכל"
          variant={isAllSelected ? "default" : "outline"}
          className={isAllSelected
            ? "bg-accent text-accent-foreground"
            : "border-border text-muted-foreground"
          }
          onClick={() => onCategoryChange('all')}
        />
      )}
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.slug);
        return (
          <CategoryBadge
            key={category.id}
            category={category}
            isSelected={isSelected}
            onClick={() => onCategoryChange(category.slug)}
          />
        );
      })}
    </div>
  );
}
