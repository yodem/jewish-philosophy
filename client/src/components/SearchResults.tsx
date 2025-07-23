'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchContent, SearchFilters, SearchResult, SearchResponse } from '@/data/services';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { StrapiImage } from './StrapiImage';
import { Calendar, ChevronLeft, ChevronRight, FileText, Video, List, MessageSquare, BookOpen } from 'lucide-react';

interface SearchResultsProps {
  filters: SearchFilters;
}

const contentTypeConfig = {
  blog: { icon: FileText, label: 'בלוג', color: 'bg-blue-100 text-blue-800', path: '/blog' },
  video: { icon: Video, label: 'סרטון', color: 'bg-red-100 text-red-800', path: '/playlists' },
  playlist: { icon: List, label: 'רשימת נגינה', color: 'bg-green-100 text-green-800', path: '/playlists' },
  responsa: { icon: MessageSquare, label: 'שו"ת', color: 'bg-purple-100 text-purple-800', path: '/responsa' },
  writing: { icon: BookOpen, label: 'כתב', color: 'bg-orange-100 text-orange-800', path: '/writings' },
};

const SearchResults: React.FC<SearchResultsProps> = ({ filters }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await searchContent(filters);
        setResults(response);
      } catch (err) {
        setError('שגיאה בחיפוש. אנא נסה שוב.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
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
    const config = contentTypeConfig[result.type];
    if (result.type === 'video' && result.playlistSlug) {
      return `${config.path}/${result.playlistSlug}/${result.slug}`;
    }
    return `${config.path}/${result.slug}`;
  };

  const getResultImage = (result: SearchResult) => {
    if (result.coverImage?.url) {
      return result.coverImage.url;
    }
    if (result.imageUrl300x400) {
      return result.imageUrl300x400;
    }
    if (result.imageUrlStandard) {
      return result.imageUrlStandard;
    }
    return null;
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
      <Card className="p-8 text-center">
        <p className="text-red-600 text-lg">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          נסה שוב
        </Button>
      </Card>
    );
  }

  if (!results || results.data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">לא נמצאו תוצאות</h3>
        <p className="text-gray-600 mb-4">נסה לשנות את מונחי החיפוש או הפילטרים</p>
        <Button onClick={() => router.push('/')}>
          חזור לעמוד הבית
        </Button>
      </Card>
    );
  }

  const { data, meta } = results;
  const { pagination } = meta;

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="text-center text-gray-600">
        <p>
          נמצאו {pagination.total} תוצאות
          {pagination.pageCount > 1 && (
            <span> (עמוד {pagination.page} מתוך {pagination.pageCount})</span>
          )}
        </p>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {data.map((result) => {
          const config = contentTypeConfig[result.type];
          const Icon = config.icon;
          const image = getResultImage(result);

          return (
            <Card key={`${result.type}-${result.id}`} className="p-6 hover:shadow-lg transition-shadow">
              <Link href={getResultLink(result)} className="block">
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    {/* Content Type and Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={config.color}>
                        <Icon className="w-4 h-4 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {result.title}
                    </h3>

                    {/* Description */}
                    {result.description && (
                      <p className="text-gray-600 mb-3 line-clamp-3">
                        {result.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {result.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(result.publishedAt)}
                        </div>
                      )}
                      
                      {result.type === 'writing' && result.author && (
                        <div className="text-gray-600">
                          מאת: {result.author.name}
                        </div>
                      )}
                      
                      {result.type === 'writing' && result.writingType && (
                        <Badge variant="outline" className="text-xs">
                          {result.writingType === 'book' ? 'ספר' : 'מאמר'}
                        </Badge>
                      )}
                      
                      {result.categories && result.categories.length > 0 && (
                        <div className="flex gap-2">
                          {result.categories.slice(0, 2).map((category) => (
                            <Badge key={category.id} variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          ))}
                          {result.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  {image && (
                    <div className="flex-shrink-0">
                      <StrapiImage
                        src={image}
                        alt={result.title}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.pageCount > 1 && (
        <>
          <Separator />
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronRight className="w-4 h-4 mr-1" />
              הקודם
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, pagination.pageCount) }, (_, i) => {
                let pageNum;
                if (pagination.pageCount <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pageCount - 2) {
                  pageNum = pagination.pageCount - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pageCount}
            >
              הבא
              <ChevronLeft className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults; 