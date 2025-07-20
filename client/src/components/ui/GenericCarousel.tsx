"use client";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MediaCard from "@/components/ui/MediaCard";
import Link from "next/link";
import type { Playlist, Video } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface GenericCarouselProps {
  items: (Playlist | Video)[];
  type: "playlist" | "video";
  baseUrl: string; // e.g. "/playlists" or `/playlists/${playlistSlug}`
  className?: string;
}
function SampleNextArrow(props: { className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const { onClick } = props;
  return (

        <ChevronLeft onClick={onClick} className="text-blue-600 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md hover:bg-blue-100 transition-colors duration-200 border border-gray-200 left-[-28px] cursor-pointer absolute top-1/2 -translate-y-1/2 z-10" size={22} />
  );
}

function SamplePrevArrow(props: { className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const { className, style, onClick } = props;
  return (

        <ChevronRight onClick={onClick} className="text-blue-600 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md hover:bg-blue-100 transition-colors duration-200 border border-gray-200 right-[-28px] cursor-pointer absolute top-1/2 -translate-y-1/2 z-10" size={22} />
  );
}

  
export default function GenericCarousel({ items, type, baseUrl, className }: GenericCarouselProps) {
  // Choose background color based on type
  const bgClass = type === "playlist" ? "bg-blue-50 dark:bg-blue-950/30" : "bg-green-50 dark:bg-green-950/30";
  const isPlaylist = type === "playlist";
  
  const settings = {
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    rtl: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ],
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />

  };

  return (
    <div className={cn("w-full max-w-full md:max-w-3xl xl:max-w-6xl py-4 px-2 rounded-xl", className)}>
      <Slider {...settings}>
        {items.map((item) => (
          <div key={item.id} className="px-2">
            <Link href={`${baseUrl}/${(item as Playlist).slug}`} className="no-underline h-full block">
              <MediaCard
                image={(item as any).imageUrl300x400 || (item as any).imageUrlStandard}
                title={item.title}
                description={isPlaylist ? (item as Playlist).description : undefined}
                episodeCount={isPlaylist ? (item as Playlist).videos?.length : undefined}
                type={type}
              />
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
}