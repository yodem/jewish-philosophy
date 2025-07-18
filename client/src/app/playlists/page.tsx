import BlockRenderer from "@/components/blocks/BlockRenderer";
import { getAllPlaylists, getPageBySlug } from "@/data/loaders";
import MediaCard from "@/components/ui/MediaCard";
import Link from "next/link";
import type { Playlist } from "@/types";
import { Carousel, CarouselPrevious, CarouselContent, CarouselItem, CarouselNext } from "@/components/ui/carousel";

export default async function PlaylistsPage() {
  const pageRes = await getPageBySlug("playlists");
  const playlists: Playlist[] = await getAllPlaylists();
  const data = pageRes?.data
  const blocks = data?.[0]?.blocks || [];

  return (
    <div className="container mx-auto px-2 my-8 flex flex-col items-center justify-center w-full overflow-x-hidden">
      <BlockRenderer blocks={blocks} />
      <div className="mt-16 flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold mb-4 text-center">סדרות</h3>
          <div className="w-full max-w-full overflow-x-auto md:max-w-3xl xl:max-w-6xl">
            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
              <CarouselPrevious />
              <CarouselContent className="md:-ml-4">
                {playlists.map((playlist) => (
                  <CarouselItem
                    key={playlist.id}
                    className="w-full basis-full pl-2 md:pl-4 md:basis-1/2 xl:basis-1/3"
                  >
                    <Link href={`/playlists/${playlist.slug}`} className="no-underline h-full">
                      <MediaCard
                        image={playlist.imageUrl300x400 || playlist.imageUrlStandard}
                        title={playlist.title}
                        description={playlist.description}
                        episodeCount={playlist.videos?.length}
                        type="playlist"
                        className="h-full"
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext />
            </Carousel>
          </div>
        </div>
    </div>
  )
} 