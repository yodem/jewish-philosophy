import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CategoryCombobox } from './CategoryCombobox';
import { CategoryBadge } from './CategoryBadge';
import { Search, Filter } from 'lucide-react';
import { CONTENT_TYPES } from '../../consts';
import { getAllCategories } from '@/data/services';
import { Category } from '@/types';
import { trackContentTypeFilter, trackCategoryFilter } from '@/lib/analytics';

// Content types for search with "all" option
const SEARCH_CONTENT_TYPES = [
  { value: 'all', label: 'כל התכנים' },
  ...CONTENT_TYPES
];

interface SearchFormProps {
  searchQuery: string;
  selectedContentType: string;
  selectedCategory: string;
  onSearchQueryChange: (query: string) => void;
  onContentTypeChange: (type: string) => void;
  onCategoryChange: (category: string) => void;
  onSubmit: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  showSubmitButton?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchQuery,
  selectedContentType,
  selectedCategory,
  onSearchQueryChange,
  onContentTypeChange,
  onCategoryChange,
  onSubmit,
  onKeyPress,
  disabled = false,
  showSubmitButton = true,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Handle form key down to prevent conflicts
  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    // Let the combobox handle its own Enter key events
    if (e.key === 'Enter' && e.target !== e.currentTarget) {
      e.preventDefault();
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="grid gap-4" onKeyDown={handleFormKeyDown}>
      {/* Search Input */}
      <div className="grid gap-2">
        <label htmlFor="search" className="text-sm font-medium text-right">
          מה תרצו לחפש? <span className="text-gray-500">(אופציונלי)</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            placeholder="הקלידו כאן..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={onKeyPress}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !disabled) {
                e.preventDefault();
                onSubmit();
              }
            }}
            className="pl-10 text-right"
            dir="rtl"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Content Type Filter - Required */}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-right flex items-center gap-2">
          <Filter className="h-4 w-4" />
          סוג תוכן *
        </label>
        <p className="text-xs text-gray-500 text-right">
          בחר סוג תוכן או השאר ריק לחיפוש בכל סוגי התוכן
        </p>
        <div className="flex flex-col gap-2">
          {/* Selected Content Type Display */}
          {selectedContentType !== 'all' && (
            <div className="flex items-center gap-2">
              {SEARCH_CONTENT_TYPES
                .filter(type => type.value === selectedContentType)
                .map(type => (
                  <CategoryBadge
                    key={type.value}
                    contentType={type.value}
                    label={type.label}
                    variant={type.value === 'all' ? 'outline' : 'default'}
                    className={
                      type.value === 'all'
                        ? "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                        : ""
                    }
                    showRemoveIcon={true}
                    onClick={() => {
                      trackContentTypeFilter('all', selectedContentType);
                      onContentTypeChange('all');
                    }}
                  />
                ))}
            </div>
          )}

          {/* All Content Types Indicator */}
          {selectedContentType === 'all' && (
            <div className="flex items-center gap-2">
              <CategoryBadge
                contentType="all"
                label="כל התכנים"
                variant="outline"
                className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
              />
            </div>
          )}

          {/* Content Type Selection Options */}
          <div className="flex flex-wrap gap-2 justify-start">
            {SEARCH_CONTENT_TYPES
              .filter(type => type.value !== selectedContentType)
              .map((type) => (
                <CategoryBadge
                  key={type.value}
                  contentType={type.value}
                  label={type.label}
                  variant={type.value === 'all' ? 'outline' : 'default'}
                  className={
                    type.value === 'all'
                      ? "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                      : "cursor-pointer"
                  }
                  onClick={() => {
                    trackContentTypeFilter(type.value, selectedContentType);
                    onContentTypeChange(type.value);
                  }}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-right">
          קטגוריה
        </label>
        <p className="text-xs text-gray-500 text-right">
          בחר קטגוריה או השאר ריק לחיפוש בכל הקטגוריות
        </p>
        <div className="flex flex-col gap-2">
         

        

          {/* Category Combobox */}
          <CategoryCombobox
            categories={categories}
            value={selectedCategory}
            onValueChange={(value) => {
              trackCategoryFilter(value, selectedContentType);
              onCategoryChange(value);
            }}
            placeholder="בחר קטגוריה..."
            emptyMessage="לא נמצאו קטגוריות."
            disabled={loadingCategories}
            loading={loadingCategories}
            className="text-right"
          />
        </div>
      </div>


      {/* Search Button */}
      {showSubmitButton && (
        <>
          <p className="text-xs text-gray-500 text-center">
            הזינו טקסט לחיפוש או בחרו קטגוריה/סוג תוכן ספציפי
          </p>
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={disabled || (!searchQuery && selectedCategory === 'all' && selectedContentType === 'all')}
          >
            חפשו
          </Button>
        </>
      )}
    </form>
  );
};

export default SearchForm; 