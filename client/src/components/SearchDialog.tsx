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
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    // Content type is always required
    params.set('type', selectedContentType);

    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    // Track search event
    trackSearch(
      searchQuery.trim(),
      selectedContentType,
      selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined
    );

    const searchUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(searchUrl);
    onOpenChange(false);
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery('');
      setSelectedContentType('all'); // Reset to "all content types" like category
      setSelectedCategory('');
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
            selectedCategory={selectedCategory}
            onSearchQueryChange={setSearchQuery}
            onContentTypeChange={setSelectedContentType}
            onCategoryChange={setSelectedCategory}
            onSubmit={handleSearch}
            disabled={!searchQuery.trim() && !selectedCategory}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog; 