"use client";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MediaCard from "@/components/ui/MediaCard";
import Link from "next/link";
import type { Blog, Playlist, Video } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useCallback, useState } from "react";

interface GenericCarouselProps {
  items: (Playlist | Video | Blog)[];
  type: "playlist" | "video" | "blog";
  baseUrl: string; // e.g. "/playlists" or `/playlists/${playlistSlug}`
  className?: string;
}

function SampleNextArrow(props: { className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const { onClick } = props;
  return (
    <div className="hidden md:block absolute z-10 top-1/2 -translate-y-1/2 left-0 -ml-4">
      <ChevronLeft 
        onClick={onClick} 
        className="text-blue-600 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md hover:bg-blue-100 transition-colors duration-200 border border-gray-200 cursor-pointer" 
        size={22} 
      />
    </div>
  );
}

function SamplePrevArrow(props: { className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const { onClick } = props;
  return (
    <div className="hidden md:block absolute z-10 top-1/2 -translate-y-1/2 right-0 -mr-4">
      <ChevronRight 
        onClick={onClick} 
        className="text-blue-600 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md hover:bg-blue-100 transition-colors duration-200 border border-gray-200 cursor-pointer" 
        size={22} 
      />
    </div>
  );
}

export default function GenericCarousel({ items, type, baseUrl, className }: GenericCarouselProps) {


  // Dicts for field access by type
  const imageField: Record<GenericCarouselProps["type"], (item: Playlist | Video | Blog) => string | undefined> = {
    playlist: (item) => (item as Playlist).imageUrl300x400 || (item as Playlist).imageUrlStandard,
    video: (item) => (item as Video).imageUrl300x400 || (item as Video).imageUrlStandard,
    blog: (item) => (item as Blog).coverImage?.url,
  };

  const descriptionField: Record<GenericCarouselProps["type"], (item: Playlist | Video | Blog) => string | undefined> = {
    playlist: (item) => (item as Playlist).description,
    video: (item) => (item as Video).description,
    blog: (item) => (item as Blog).author.name,
  };

  const episodeCountField: Record<GenericCarouselProps["type"], (item: Playlist | Video | Blog) => number | undefined> = {
    playlist: (item) => (item as Playlist).videos?.length,
    video: () => undefined,
    blog: () => undefined,
  };

  // Determine slidesToShow based on type and screen size (default 3)
  const defaultSlidesToShow = 3;
  const shouldDisableInfinite =  items.length <= defaultSlidesToShow;

  // Track current slide for mobile swipe handling

  
  const settings = {
    dots: true,
    infinite: !shouldDisableInfinite,
    speed: 500,
    slidesToShow: defaultSlidesToShow,
    slidesToScroll: 1,
    rtl: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
          swipeToSlide: true,
          infinite: false, // Always disable infinite on mobile
          speed: 300,
        }
      }
    ],
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    dotsClass: "slick-dots !bottom-[-25px]"
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full max-w-full md:max-w-3xl xl:max-w-6xl py-4 px-0 md:px-6 mb-8 relative h-full", className)}>
      <div className=" h-full">
        <Slider {...settings}>
          {items.map((item) => (
            <div key={item.id} className="px-2 pb-6">
              <Link href={`${baseUrl}/${item.slug}`} className="no-underline block h-full">
                <MediaCard
                  image={imageField[type](item) || ""}
                  title={item.title}
                  description={descriptionField[type](item)}
                  episodeCount={episodeCountField[type](item)}
                  type={type}
                />
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}