import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getPlaylistsPaginated,
  getBlogsPaginated,
  getAllResponsas,
  getWritingsPaginated,
} from "@/data/loaders";
import { formatDate } from "@/lib/date-utils";
import type { Playlist, Blog, Responsa, Writing } from "@/types";

interface ContentSection {
  title: string;
  href: string;
  color: {
    border: string;
    dot: string;
    link: string;
    headingBorder: string;
  };
}

const SECTIONS: ContentSection[] = [
  {
    title: "סדרות שיעורים",
    href: "/playlists",
    color: {
      border: "hover:border-ct-video/40",
      dot: "bg-ct-video",
      link: "text-ct-video",
      headingBorder: "border-ct-video",
    },
  },
  {
    title: "מהבלוג",
    href: "/blog",
    color: {
      border: "hover:border-ct-blog/40",
      dot: "bg-ct-blog",
      link: "text-ct-blog",
      headingBorder: "border-ct-blog",
    },
  },
  {
    title: "שאלות ותשובות",
    href: "/responsa",
    color: {
      border: "hover:border-ct-responsa/40",
      dot: "bg-ct-responsa",
      link: "text-ct-responsa",
      headingBorder: "border-ct-responsa",
    },
  },
  {
    title: "כתבים",
    href: "/writings",
    color: {
      border: "hover:border-ct-writing/40",
      dot: "bg-ct-writing",
      link: "text-ct-writing",
      headingBorder: "border-ct-writing",
    },
  },
];

export default async function HomeContentGrid() {
  const [playlists, blogs, responsaResult, writingsResult] = await Promise.all([
    getPlaylistsPaginated(1, 3),
    getBlogsPaginated(1, 3),
    getAllResponsas(1, 3),
    getWritingsPaginated(1, 3),
  ]);

  const responsas: Responsa[] = responsaResult?.data ?? [];
  const writings: Writing[] = writingsResult?.data ?? [];

  return (
    <section className="py-8 md:py-12" aria-label="תוכן אחרון">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Playlists */}
        <ContentCard section={SECTIONS[0]}>
          <ul className="mb-8 space-y-4">
            {(playlists as Playlist[]).map((playlist) => (
              <li key={playlist.id}>
                <Link
                  href={`/playlists/${playlist.slug}`}
                  className="flex flex-col gap-1 text-foreground/80 transition-colors hover:text-ct-video"
                >
                  <div className="flex items-start gap-3">
                    <span className="size-1.5 shrink-0 rounded-full bg-ct-video mt-2" />
                    <span className="font-medium leading-tight">{playlist.title}</span>
                  </div>
                  {playlist.publishedAt && (
                    <div className="text-xs text-muted-foreground mr-4 pr-0.5">
                      {formatDate(playlist.publishedAt)}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </ContentCard>

        {/* Blog */}
        <ContentCard section={SECTIONS[1]}>
          <ul className="mb-8 space-y-4">
            {(blogs as Blog[]).map((blog) => (
              <li key={blog.id}>
                <Link
                  href={`/blog/${blog.slug}`}
                  className="flex flex-col gap-1 text-foreground/80 transition-colors hover:text-ct-blog"
                >
                  <div className="flex items-start gap-3">
                    <span className="size-1.5 shrink-0 rounded-full bg-ct-blog mt-2" />
                    <span className="font-medium leading-tight">{blog.title}</span>
                  </div>
                  {blog.publishedAt && (
                    <div className="text-xs text-muted-foreground mr-4 pr-0.5">
                      {formatDate(blog.publishedAt)}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </ContentCard>

        {/* Responsa */}
        <ContentCard section={SECTIONS[2]}>
          <ul className="mb-8 space-y-4">
            {responsas.map((responsa) => (
              <li key={responsa.id}>
                <Link
                  href={`/responsa/${responsa.slug}`}
                  className="flex flex-col gap-1 text-foreground/80 transition-colors hover:text-ct-responsa"
                >
                  <div className="flex items-start gap-3">
                    <span className="size-1.5 shrink-0 rounded-full bg-ct-responsa mt-2" />
                    <span className="font-medium leading-tight">{responsa.title}</span>
                  </div>
                  {responsa.publishedAt && (
                    <div className="text-xs text-muted-foreground mr-4 pr-0.5">
                      {formatDate(responsa.publishedAt)}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </ContentCard>

        {/* Writings */}
        <ContentCard section={SECTIONS[3]}>
          <ul className="mb-8 space-y-4">
            {writings.map((writing) => (
              <li key={writing.id}>
                <Link
                  href={`/writings/${writing.slug}`}
                  className="flex flex-col gap-1 text-foreground/80 transition-colors hover:text-ct-writing"
                >
                  <div className="flex items-start gap-3">
                    <span className="size-1.5 shrink-0 rounded-full bg-ct-writing mt-2" />
                    <span className="font-medium leading-tight">{writing.title}</span>
                  </div>
                  {writing.publishedAt && (
                    <div className="text-xs text-muted-foreground mr-4 pr-0.5">
                      {formatDate(writing.publishedAt)}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </ContentCard>
      </div>
    </section>
  );
}

function ContentCard({
  section,
  children,
}: {
  section: ContentSection;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`group rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md ${section.color.border}`}
    >
      <div className={`mb-6 border-r-4 pr-3 ${section.color.headingBorder}`}>
        <h2 className="text-2xl font-bold text-foreground leading-snug">{section.title}</h2>
      </div>

      {children}

      <Link
        href={section.href}
        className={`inline-flex items-center gap-1 font-bold transition-colors duration-150 hover:opacity-80 ${section.color.link}`}
      >
        צפו בהכל
        <ChevronLeft className="ms-1 size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
