import { getPlaylistsPaginated } from "@/data/loaders";
import type { Playlist } from "@/types";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import Breadcrumbs from "@/components/Breadcrumbs";
import PlaylistsPageClient from "./PlaylistsPageClient";

export const metadata: Metadata = generateMetadata({
  title: "סדרות שיעורים | שלום צדיק - פילוסופיה דתית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה דתית",
  url: "/playlists",
  type: "website",
  keywords: "סדרות שיעורים, שיעורי וידאו, פילוסופיה דתית, פילוסופיה דתית, הרמב\"ם, מורה נבוכים, כוזרי, קורסים יהודיים, שלום צדיק, מבוא לפילוסופיה דתית, לימוד ברצף, יהדות רציונלית",
});

export default async function PlaylistsPage() {
  const playlists: Playlist[] = await getPlaylistsPaginated(1, 10);

  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Hero section */}
      <section className="w-full bg-gradient-to-br from-primary to-primary/80 py-16 md:py-24 px-4 text-center">
        <div className="container mx-auto">
          <Breadcrumbs
            items={[
              { label: "בית", href: "/" },
              { label: "סדרות" }
            ]}
            className="justify-center mb-6 text-primary-foreground/70"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 tracking-tight">
            סדרות שיעורים
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
            סדרות הרצאות מובנות בפילוסופיה יהודית — מיסודות המחשבה ועד לסוגיות מתקדמות.
          </p>
        </div>
      </section>

      {/* Playlist grid */}
      <ErrorBoundary>
        <PlaylistsPageClient playlists={playlists} />
      </ErrorBoundary>
    </div>
  );
}
