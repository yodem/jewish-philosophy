import Link from "next/link";
import { Video, BookOpen, MessageSquare } from "lucide-react";
import { CONTENT_TYPE_CONFIG } from "../../consts";
import { Video as VideoType, Writing, Responsa } from "@/types";

type ContentType = 'video' | 'writing' | 'responsa';

interface ContentChipProps {
  content: VideoType | Writing | Responsa;
  type: ContentType;
  size?: 'sm' | 'md';
}

const getContentPath = (content: VideoType | Writing | Responsa, type: ContentType): string => {
  switch (type) {
    case 'video':
      const video = content as VideoType;
      if (video.playlist && typeof video.playlist === 'object') {
        return `/playlists/${video.playlist.slug}/${video.slug}`;
      }
      return `/playlists/${video.slug}`;
    case 'writing':
      return `/writings/${content.slug}`;
    case 'responsa':
      return `/responsa/${content.slug}`;
    default:
      return '#';
  }
};

const getIcon = (type: ContentType) => {
  switch (type) {
    case 'video':
      return Video;
    case 'writing':
      return BookOpen;
    case 'responsa':
      return MessageSquare;
    default:
      return BookOpen;
  }
};

export default function ContentChip({ content, type, size = 'md' }: ContentChipProps) {
  const config = CONTENT_TYPE_CONFIG[type];
  const Icon = getIcon(type);
  const path = getContentPath(content, type);

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-1 text-sm';
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3 h-3';

  return (
    <Link
      href={path}
      className={`inline-flex items-center ${sizeClasses} rounded-full transition-colors duration-200 hover:opacity-80 ${config.color}`}
    >
      <Icon className={`${iconSize} mr-1`} />
      {content.title}
    </Link>
  );
}