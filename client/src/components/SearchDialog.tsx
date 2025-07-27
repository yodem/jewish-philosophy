'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import SearchForm from './SearchForm';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('blog'); // Default to blog
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    // Content type is always required
    params.set('type', selectedContentType);
    
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    const searchUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(searchUrl);
    onOpenChange(false);
    
    // Reset form
    setSearchQuery('');
    setSelectedContentType('blog');
    setSelectedCategory('all');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[350px] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-right">חיפוש תוכן</DialogTitle>
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
            disabled={!searchQuery.trim() && selectedCategory === 'all'}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog; 