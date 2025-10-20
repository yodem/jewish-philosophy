import BlockRenderer from "@/components/blocks/BlockRenderer";
import { getPlaylistsPaginated, getPageBySlug } from "@/data/loaders";
import type { Playlist } from "@/types";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import Breadcrumbs from "@/components/Breadcrumbs";
import PlaylistsPageClient from "./PlaylistsPageClient";

export const metadata: Metadata = generateMetadata({
  title: "סדרות שיעורים | שלום צדיק - פילוסופיה יהודית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה יהודית",
  url: "/playlists",
  type: "website",
  keywords: "סדרות שיעורים, שיעורי וידאו, פילוסופיה יהודית, פילוסופיה דתית, הרמב\"ם, מורה נבוכים, כוזרי, קורסים יהודיים, שלום צדיק, מבוא לפילוסופיה יהודית, לימוד ברצף, יהדות רציונלית",
});

function LoadingFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Skeleton className="w-32 h-32 rounded-full bg-blue-200" />
    </div>
  );
}

export default async function PlaylistsPage() {
  const pageRes = await getPageBySlug("playlists");
  const playlists: Playlist[] = await getPlaylistsPaginated(1, 10);
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];

  return (
      <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: "בית", href: "/" },
              { label: "סדרות" }
            ]}
          />
        </div>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <BlockRenderer blocks={blocks} />
          </Suspense>
        </ErrorBoundary>
        <PlaylistsPageClient playlists={playlists} />
      </div>
  );
} 