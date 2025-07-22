"use client";

import { useState, useEffect } from "react";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { getAllPlaylists, getPageBySlug, searchPlaylists, searchVideos } from "@/data/loaders";
import type { Playlist, Video } from "@/types";
import GenericCarousel from "@/components/ui/GenericCarousel";
import SearchCard from "@/components/SearchCard";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [blocks, setBlocks] = useState<Array<{ id: number; __component?: string; [key: string]: any }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pageRes, playlistsData] = await Promise.all([
          getPageBySlug("playlists"),
          getAllPlaylists()
        ]);
        
        const data = pageRes?.data;
        setBlocks(data?.[0]?.blocks || []);
        setPlaylists(playlistsData);
        setFilteredPlaylists(playlistsData);
        
        // Extract all videos from playlists
        const allVideos = playlistsData.flatMap((playlist: Playlist) => 
          playlist.videos?.map(video => ({ ...video, playlist })) || []
        );
        setVideos(allVideos);
        setFilteredVideos(allVideos);
      } catch (error) {
        console.error("Error loading playlist data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = async (query: string, _filters: Record<string, string>) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    try {
      if (!query.trim()) {
        setFilteredPlaylists(playlists);
        setFilteredVideos(videos);
      } else {
        const [playlistResults, videoResults] = await Promise.all([
          searchPlaylists(query),
          searchVideos(query)
        ]);
        
        setFilteredPlaylists(playlistResults);
        setFilteredVideos(videoResults);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 px-4 text-center">טוען...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "פלייליסטים" },
        ]}
      />
      
      <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
                 <BlockRenderer blocks={blocks as any} />
        
        <SearchCard
          onSearch={handleSearch}
          placeholder="חפש פלייליסטים וסרטונים..."
          title="חפש פלייליסטים וסרטונים"
        />
        
        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-pulse">מחפש...</div>
          </div>
        )}
        
        {/* Show search results when searching */}
        {searchQuery && !isSearching && (
          <div className="w-full space-y-8">
            {filteredPlaylists.length > 0 && (
              <div className="w-full flex flex-col items-center justify-center">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">
                  פלייליסטים ({filteredPlaylists.length})
                </h3>
                <GenericCarousel 
                  items={filteredPlaylists} 
                  type="playlist" 
                  baseUrl="/playlists" 
                />
              </div>
            )}
            
            {filteredVideos.length > 0 && (
              <div className="w-full flex flex-col items-center justify-center">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">
                  סרטונים ({filteredVideos.length})
                </h3>
                <GenericCarousel 
                  items={filteredVideos} 
                  type="video" 
                  baseUrl="/playlists" 
                />
              </div>
            )}
            
            {filteredPlaylists.length === 0 && filteredVideos.length === 0 && (
                             <div className="text-center py-8 text-gray-500">
                 לא נמצאו תוצאות עבור &quot;{searchQuery}&quot;
               </div>
            )}
          </div>
        )}
        
        {/* Show all playlists when not searching */}
        {!searchQuery && filteredPlaylists.length > 0 && (
          <div className="w-full flex flex-col items-center justify-center mt-8 sm:mt-16">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">סדרות</h3>
            <GenericCarousel 
              items={filteredPlaylists} 
              type="playlist" 
              baseUrl="/playlists" 
            />
          </div>
        )}
      </div>
    </div>
  );
} 