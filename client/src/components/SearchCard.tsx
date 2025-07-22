"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface SearchFilter {
  id: string;
  name: string;
  value: string;
}

interface SearchCardProps {
  onSearch: (query: string, filters: Record<string, string>) => void;
  placeholder?: string;
  filters?: {
    categories?: SearchFilter[];
    contentTypes?: SearchFilter[];
  };
  className?: string;
  title?: string;
}

export const SearchCard: React.FC<SearchCardProps> = ({
  onSearch,
  placeholder = "חפש...",
  filters,
  className = "",
  title
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, selectedFilters);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    // Auto-search when filter changes
    onSearch(searchQuery, { ...selectedFilters, [filterType]: value });
  };

  return (
    <Card className={`p-4 mb-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          {title}
        </h3>
      )}
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            חפש
          </Button>
        </div>

        {filters && (filters.categories || filters.contentTypes) && (
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-gray-500" />
            
            {filters.categories && (
              <Select
                value={selectedFilters.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="min-w-[120px]"
              >
                <option value="">כל הקטגוריות</option>
                {filters.categories.map((category) => (
                  <option key={category.id} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}

            {filters.contentTypes && (
              <Select
                value={selectedFilters.contentType || ""}
                onChange={(e) => handleFilterChange("contentType", e.target.value)}
                className="min-w-[120px]"
              >
                <option value="">כל סוגי התוכן</option>
                {filters.contentTypes.map((type) => (
                  <option key={type.id} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </Select>
            )}

            {(selectedFilters.category || selectedFilters.contentType) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFilters({});
                  onSearch(searchQuery, {});
                }}
              >
                נקה פילטרים
              </Button>
            )}
          </div>
        )}
      </form>
    </Card>
  );
};

export default SearchCard;