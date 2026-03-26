import Link from "next/link";
import { Video, FileText, HelpCircle, BookOpen, ChevronLeft } from "lucide-react";
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
  icon: React.ReactNode;
  color: {
    border: string;
    dot: string;
    link: string;
    iconBg: string;
  };
}

const SECTIONS: ContentSection[] = [
  {
    title: "סדרות שיעורים",
    href: "/playlists",
    icon: <Video className="size-6" />,
    color: {
      border: "hover:border-blue-200 dark:hover:border-blue-800",
      dot: "bg-blue-400",
      link: "text-blue-700 dark:text-blue-400",
      iconBg: "bg-blue-600",
    },
  },
  {
    title: "מהבלוג",
    href: "/blog",
    icon: <FileText className="size-6" />,
    color: {
      border: "hover:border-emerald-200 dark:hover:border-emerald-800",
      dot: "bg-emerald-400",
      link: "text-emerald-700 dark:text-emerald-400",
      iconBg: "bg-emerald-600",
    },
  },
  {
    title: "שאלות ותשובות",
    href: "/responsa",
    icon: <HelpCircle className="size-6" />,
    color: {
      border: "hover:border-orange-200 dark:hover:border-orange-800",
      dot: "bg-orange-400",
      link: "text-orange-700 dark:text-orange-400",
      iconBg: "bg-orange-500",
    },
  },
  {
    title: "כתבים",
    href: "/writings",
    icon: <BookOpen className="size-6" />,
    color: {
      border: "hover:border-teal-200 dark:hover:border-teal-800",
      dot: "bg-teal-400",
      link: "text-teal-700 dark:text-teal-400",
      iconBg: "bg-teal-600",
    },
  },
];

export default async function HomeContentGrid() {
  const [playlists, blogs, responsaResult, writingsResult] = await Promise.all([
    getPlaylistsPaginated(1, 3),
    getBlogsPaginated(1, 2),
    getAllResponsas(1, 2),
    getWritingsPaginated(1, 2),
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
                  className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-blue-400" />
                  <span className="font-medium">{playlist.title}</span>
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
                  className="group/item flex flex-col gap-1"
                >
                  {blog.publishedAt && (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {formatDate(blog.publishedAt)}
                    </span>
                  )}
                  <span className="font-bold text-foreground transition-colors group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-400">
                    {blog.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </ContentCard>

        {/* Responsa */}
        <ContentCard section={SECTIONS[2]}>
          <ul className="mb-8 space-y-4">
            {responsas.map((responsa) => (
              <li
                key={responsa.id}
                className="rounded border-r-4 border-orange-400 bg-card p-3 font-medium text-foreground/80 shadow-sm"
              >
                <Link
                  href={`/responsa/${responsa.slug}`}
                  className="transition-colors hover:text-orange-600 dark:hover:text-orange-400"
                >
                  {responsa.title}
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
                  className="group/file flex items-center justify-between"
                >
                  <span className="font-bold text-foreground transition-colors group-hover/file:text-teal-700 dark:group-hover/file:text-teal-400">
                    {writing.title}
                  </span>
                  <FileText
                    className="size-5 text-teal-600/50"
                    aria-hidden="true"
                  />
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
      className={`group rounded-xl border border-border bg-muted/30 p-6 transition-all hover:shadow-md ${section.color.border}`}
    >
      <div className="mb-6 flex items-center gap-4">
        <div
          className={`flex size-12 items-center justify-center rounded-lg text-white shadow-inner ${section.color.iconBg}`}
          aria-hidden="true"
        >
          {section.icon}
        </div>
        <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
      </div>

      {children}

      <Link
        href={section.href}
        className={`inline-flex items-center font-bold transition-all hover:gap-2 ${section.color.link}`}
      >
        צפו בהכל
        <ChevronLeft className="ms-1 size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
