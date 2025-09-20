'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchFilters, SearchResult, SearchResponse } from '@/types';
import { searchContent } from '@/data/services';
import { trackSearch } from '@/lib/analytics';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import SearchForm from './SearchForm';
import { Calendar, FileText, Video, List, MessageSquare, BookOpen } from 'lucide-react';
import { CONTENT_TYPE_CONFIG } from '../../consts';

interface SearchResultsProps {
  filters: SearchFilters;
}

// Convert string icon names to actual components
const contentTypeConfig = {
  blog: { icon: FileText, label: CONTENT_TYPE_CONFIG.blog.label, color: CONTENT_TYPE_CONFIG.blog.color, path: CONTENT_TYPE_CONFIG.blog.path },
  video: { icon: Video, label: CONTENT_TYPE_CONFIG.video.label, color: CONTENT_TYPE_CONFIG.video.color, path: CONTENT_TYPE_CONFIG.video.path },
  playlist: { icon: List, label: CONTENT_TYPE_CONFIG.playlist.label, color: CONTENT_TYPE_CONFIG.playlist.color, path: CONTENT_TYPE_CONFIG.playlist.path },
  responsa: { icon: MessageSquare, label: CONTENT_TYPE_CONFIG.responsa.label, color: CONTENT_TYPE_CONFIG.responsa.color, path: CONTENT_TYPE_CONFIG.responsa.path },
  writing: { icon: BookOpen, label: CONTENT_TYPE_CONFIG.writing.label, color: CONTENT_TYPE_CONFIG.writing.color, path: CONTENT_TYPE_CONFIG.writing.path },
};

const SearchResults: React.FC<SearchResultsProps> = ({ filters }) => {
  const router = useRouter();
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search form state
  const [searchQuery, setSearchQuery] = useState(filters.query || '');
  const [selectedContentType, setSelectedContentType] = useState<string>(filters.contentType || 'all');

  // Debug logging
  console.log('SearchResults initialized with filters:', filters);
  console.log('selectedContentType initialized with:', filters.contentType || 'all');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const sortBy = useMemo(() => filters.sort || ['publishedAt:desc'], [filters.sort]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await searchContent({ ...filters, sort: sortBy });
        setResults(response);
        
        // Track search results
        if (filters.query) {
          trackSearch(
            filters.query,
            filters.contentType || '',
            filters.category,
            response?.meta?.pagination?.total || 0
          );
        }
      } catch (err) {
        setError('שגיאה בחיפוש. אנא נסה שוב.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [filters, sortBy]);

  // Simplified - no infinite scroll needed since we return max 20 results

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }

    // Handle content type - always set it in the URL for proper navigation
    params.set('type', selectedContentType);

    // For the new unified search API, 'all' categories should not be sent as a parameter
    // Only send category if it's not 'all'
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    // Track search event
    trackSearch(
      searchQuery.trim(),
      selectedContentType,
      selectedCategory !== 'all' ? selectedCategory : undefined
    );

    const searchUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(searchUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };



  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getResultLink = (result: SearchResult) => {
    const config = contentTypeConfig[result.contentType as 'blog' | 'video' | 'playlist' | 'responsa' | 'writing'];

    // For videos, use playlistSlug if available
    if (result.contentType === 'video' && result.playlistSlug) {
      return `${config.path}/${result.playlistSlug}/${result.slug}`;
    }

    return `${config.path}/${result.slug}`;
  };


  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-20 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        {/* Search Form */}
        <Card className="p-6">
          <SearchForm
            searchQuery={searchQuery}
            selectedContentType={selectedContentType}
            selectedCategory={selectedCategory}
            onSearchQueryChange={setSearchQuery}
            onContentTypeChange={setSelectedContentType}
            onCategoryChange={setSelectedCategory}
            onSubmit={handleSearch}
            onKeyPress={handleKeyPress}
          />
        </Card>

        <Separator />

        <Card className="p-8 text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            נסה שוב
          </Button>
        </Card>
      </div>
    );
  }

  if (!results || results.data.length === 0) {
    return (
      <div className="w-full text-center">
        {/* Search Form */}
        <Card className="p-6">
          <SearchForm
            searchQuery={searchQuery}
            selectedContentType={selectedContentType}
            selectedCategory={selectedCategory}
            onSearchQueryChange={setSearchQuery}
            onContentTypeChange={setSelectedContentType}
            onCategoryChange={setSelectedCategory}
            onSubmit={handleSearch}
            onKeyPress={handleKeyPress}
          />
        </Card>

        <Separator />
<div className="text-center p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">לא נמצאו תוצאות</h3>
          <p className="text-gray-600 mb-4">נסו לשנות את סוג התוכן או את הפילטרים</p>
        </div>
      </div>
    );
  }

  const { data, meta } = results;
  const total = meta?.total || 0;

  return (
    <div className="w-full">
      {/* Search Form */}
      <Card className="p-6">
        <SearchForm
          searchQuery={searchQuery}
          selectedContentType={selectedContentType}
          selectedCategory={selectedCategory}
          onSearchQueryChange={setSearchQuery}
          onContentTypeChange={setSelectedContentType}
          onCategoryChange={setSelectedCategory}
          onSubmit={handleSearch}
          onKeyPress={handleKeyPress}
        />
      </Card>

      <Separator />

      {/* Results Summary */}
      <div className="text-center text-gray-600 p-6">
        <p>
          נמצאו {total} תוצאות:
        </p>
      </div>

      {/* Results List */}
      <div className="space-y-4 p-6">
        {data.map((result, index) => {
          const config = contentTypeConfig[result.contentType as 'blog' | 'video' | 'playlist' | 'responsa' | 'writing'];
          const Icon = config.icon;

          return (
            <Card
              key={`${result.contentType}-${result.id}-${result.slug}-${index}`}
              className="p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <Link href={getResultLink(result)} className="block">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
                  <div className="flex-1 min-w-0">
                    {/* Content Type and Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={config.color}>
                        <Icon className="w-4 h-4 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors break-words">
                      {result.title}
                    </h3>

                    {/* Description */}
                    {result.description && (
                      <p className="text-gray-600 mb-3 line-clamp-3 break-words">
                        {result.description}
                      </p>
                    )}

                    {/* Date */}
                    {result.date && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(result.date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* End of Results Message */}
      {data.length > 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>נמצאו {data.length} תוצאות</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 