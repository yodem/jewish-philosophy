import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';
import { CategoryBadge } from './CategoryBadge';
import { Search, Filter } from 'lucide-react';
import { CONTENT_TYPES } from '../../consts';
import { useCategories } from '@/hooks/use-categories';
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
  const { categories, loadingCategories } = useCategories();

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
        <div className="flex flex-wrap gap-2 justify-start">
          {loadingCategories ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-7 w-20" />
            ))
          ) : (
            categories.map((category) => (
              <CategoryBadge
                key={category.value}
                label={category.label}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => {
                  trackCategoryFilter(category.value, selectedContentType);
                  onCategoryChange(category.value);
                }}
              />
            ))
          )}
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