'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, Filter } from 'lucide-react';
import { getAllCategories } from '@/data/services';
import { Category } from '@/types';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const contentTypes = [
  { value: 'all', label: 'הכל' },
  { value: 'blog', label: 'בלוגים' },
  { value: 'video', label: 'סרטונים' },
  { value: 'playlist', label: 'סדרות' },
  { value: 'responsa', label: 'שו"ת' },
];

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([
    { value: 'all', label: 'כל הקטגוריות' }
  ]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        const formattedCategories = [
          { value: 'all', label: 'כל הקטגוריות' },
          ...categoriesData.map((cat: Category) => ({
            value: cat.slug,
            label: cat.name
          }))
        ];
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    if (open) {
      loadCategories();
    }
  }, [open]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    if (selectedContentType !== 'all') {
      params.set('type', selectedContentType);
    }
    
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    const searchUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(searchUrl);
    onOpenChange(false);
    
    // Reset form
    setSearchQuery('');
    setSelectedContentType('all');
    setSelectedCategory('all');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[350px] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-right">חיפוש תוכן</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Search Input */}
          <div className="grid gap-2">
            <label htmlFor="search" className="text-sm font-medium text-right">
              מה תרצה לחפש?
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="הקלד כאן..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Content Type Filter */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-right flex items-center gap-2">
              <Filter className="h-4 w-4" />
              סוג תוכן
            </label>
            <div className="flex flex-wrap gap-2 justify-end">
              {contentTypes.map((type) => (
                <Badge
                  key={type.value}
                  variant={selectedContentType === type.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedContentType(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-right">
              קטגוריה
            </label>
            <div className="flex flex-wrap gap-2 justify-end">
              {categories.map((category) => (
                <Badge
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            className="w-full mt-4"
            disabled={!searchQuery.trim() && selectedContentType === 'all' && selectedCategory === 'all'}
          >
            חיפוש
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog; 