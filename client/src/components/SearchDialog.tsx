'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import SearchForm from './SearchForm';
import { trackSearch } from '@/lib/analytics';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    // Content type is always required
    params.set('type', selectedContentType);

    if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
      params.set('category', selectedCategories.join(','));
    }

    // Track search event
    trackSearch(
      searchQuery.trim(),
      selectedContentType,
      selectedCategories.length > 0 && !selectedCategories.includes('all') ? selectedCategories.join(',') : undefined
    );

    const searchUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(searchUrl);
    onOpenChange(false);
  };

  // Handle category selection with multiple selection logic
  const handleCategoryChange = (categoryValue: string) => {
    setSelectedCategories(prevCategories => {
      // If "all" is being picked, clear everything and set to ["all"]
      if (categoryValue === 'all') {
        return ['all'];
      }
      
      // If current selection includes "all", replace with the new category
      if (prevCategories.includes('all')) {
        return [categoryValue];
      }
      
      // If category is already selected, remove it (toggle off)
      if (prevCategories.includes(categoryValue)) {
        const newCategories = prevCategories.filter(cat => cat !== categoryValue);
        // If no categories left, return to "all"
        return newCategories.length === 0 ? ['all'] : newCategories;
      }
      
      // Otherwise, add the category to the selection
      return [...prevCategories, categoryValue];
    });
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery('');
      setSelectedContentType('all'); // Reset to "all content types" like category
      setSelectedCategories(['all']);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[425px] max-w-[350px] mx-auto"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on the combobox popover
          const target = e.target as HTMLElement;
          if (target.closest('[role="combobox"]') || target.closest('[data-radix-popper-content-wrapper]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-right pr-8">חפשו תוכן</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <SearchForm
            searchQuery={searchQuery}
            selectedContentType={selectedContentType}
            selectedCategories={selectedCategories}
            onSearchQueryChange={setSearchQuery}
            onContentTypeChange={setSelectedContentType}
            onCategoryChange={handleCategoryChange}
            onSubmit={handleSearch}
            disabled={!searchQuery.trim() && selectedCategories.includes('all')}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog; 