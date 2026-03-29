'use client';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StrapiImage } from '@/components/shared/StrapiImage';

export type ContentCardType = 'playlist' | 'video' | 'blog' | 'book' | 'article';

export interface ContentCardProps {
  image: string;
  title: string;
  description?: string;
  episodeCount?: number;
  className?: string;
  type: ContentCardType;
  isLarge?: boolean;
}

export default function ContentCard({
  image,
  title,
  description,
  episodeCount,
  className,
  type,
  isLarge = false,
}: ContentCardProps) {
  const buttonTextMap: Record<ContentCardType, string> = {
    playlist: 'צפו בסדרה',
    video: 'צפו בסרטון',
    blog: 'קראו עוד',
    book: 'צפו בספר',
    article: 'קראו את המאמר',
  };

  return (
    <Card
      className={cn(
        "group flex flex-col w-full h-auto items-center transition-shadow cursor-pointer overflow-hidden",
        "bg-card rounded-lg shadow-sm border border-border/50 hover:shadow-md p-0 gap-0",
        className
      )}
    >
      {/* Image container with hover zoom */}
      <div
        className={cn(
          "w-full overflow-hidden relative bg-muted",
          !isLarge && "aspect-video"
        )}
      >
        {!isLarge ? (
      <StrapiImage
        src={image}
        alt={title}
        fill
        quality={75}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        objectFit="cover"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        priority
      />
        ) : (
          <StrapiImage
            src={image}
            alt={title}
            width={800}
            height={600}
            quality={100}
            objectFit="contain"
            className="w-full h-auto object-contain"
            priority
          />
        )}
        
        {typeof episodeCount === 'number' && (
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
            {episodeCount} שיעורים
          </span>
        )}
      </div>
      <div className="flex flex-col items-center p-6 w-full">
        <h3 className="font-bold mb-1 text-center text-lg line-clamp-2 text-foreground">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm mb-4 text-right line-clamp-2 leading-relaxed w-full">{description}</p>
        )}
        <div className={cn(buttonVariants({ variant: "default" }), "mt-auto cursor-pointer w-full")}>{buttonTextMap[type]}</div>
      </div>
    </Card>
  );
}
