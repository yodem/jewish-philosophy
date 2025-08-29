import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';
import { CategoryBadge } from './CategoryBadge';
import { Search, Filter } from 'lucide-react';
import { CONTENT_TYPES } from '../../consts';
import { getAllCategories } from '@/data/services';
import { Category } from '@/types';
import { trackContentTypeFilter, trackCategoryFilter } from '@/lib/analytics';

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

  return (
    <div className="grid gap-4">
      {/* Search Input */}
      <div className="grid gap-2">
        <label htmlFor="search" className="text-sm font-medium text-right">
          מה תרצו לחפש?
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
          />
        </div>
      </div>

      {/* Content Type Filter - Required */}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-right flex items-center gap-2">
          <Filter className="h-4 w-4" />
          סוג תוכן *
        </label>
        <div className="flex flex-wrap gap-2 justify-start">
          {CONTENT_TYPES.map((type) => (
            <CategoryBadge
              key={type.value}
              contentType={type.value}
              label={type.label}
              variant={selectedContentType === type.value ? "default" : "outline"}
              onClick={() => {
                trackContentTypeFilter(type.value, selectedContentType);
                onContentTypeChange(type.value);
              }}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 text-right">* חובה לבחור סוג תוכן אחד</p>
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
          {/* Selected Category Display */}
          {selectedCategory !== 'all' && (
            <div className="flex items-center gap-2">
              {categories
                .filter(cat => cat.slug === selectedCategory)
                .map(category => (
                  <CategoryBadge
                    key={category.id}
                    category={category}
                    variant="default"
                    showRemoveIcon={true}
                    onClick={() => {
                      trackCategoryFilter('all', selectedContentType);
                      onCategoryChange('all');
                    }}
                  />
                ))}
            </div>
          )}

          {/* All Categories Indicator */}
          {selectedCategory === 'all' && (
            <div className="flex items-center gap-2">
              <CategoryBadge
                contentType="all"
                label="כל הקטגוריות"
                variant="outline"
                className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
              />
            </div>
          )}

          {/* Category Selection Options */}
          <div className="flex flex-wrap gap-2 justify-start">
            {loadingCategories ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-7 w-20" />
              ))
            ) : (
              <>
                {/* Show "all categories" option when no specific category is selected */}
                {selectedCategory !== 'all' && (
                  <CategoryBadge
                    contentType="all"
                    label="כל הקטגוריות"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      trackCategoryFilter('all', selectedContentType);
                      onCategoryChange('all');
                    }}
                  />
                )}
                
                {/* Show all categories except the currently selected one */}
                {categories
                  .filter(category => category.slug !== selectedCategory)
                  .map((category) => (
                    <CategoryBadge
                      key={category.id}
                      category={category}
                      variant="default"
                      className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                      onClick={() => {
                        trackCategoryFilter(category.slug, selectedContentType);
                        onCategoryChange(category.slug);
                      }}
                    />
                  ))}
              </>
            )}
          </div>
        </div>
      </div>


      {/* Search Button */}
      {showSubmitButton && (
        <Button
          onClick={onSubmit}
          className="w-full mt-4"
          disabled={disabled || !selectedContentType}
        >
          חפשו
        </Button>
      )}
    </div>
  );
};

export default SearchForm; 