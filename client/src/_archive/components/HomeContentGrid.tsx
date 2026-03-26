import Link from "next/link";
import { Video, FileText, HelpCircle, BookOpen, ChevronLeft } from "lucide-react";
import { getPlaylistsPaginated, getBlogsPaginated, getAllResponsas, getWritingsPaginated } from "@/data/loaders";
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
    icon: <Video className="w-6 h-6" />,
    color: {
      border: "hover:border-blue-200",
      dot: "bg-blue-400",
      link: "text-blue-700",
      iconBg: "bg-blue-600",
    },
  },
  {
    title: "מהבלוג",
    href: "/blog",
    icon: <FileText className="w-6 h-6" />,
    color: {
      border: "hover:border-emerald-200",
      dot: "bg-emerald-400",
      link: "text-emerald-700",
      iconBg: "bg-emerald-600",
    },
  },
  {
    title: "שאלות ותשובות",
    href: "/responsa",
    icon: <HelpCircle className="w-6 h-6" />,
    color: {
      border: "hover:border-orange-200",
      dot: "bg-orange-400",
      link: "text-orange-700",
      iconBg: "bg-orange-500",
    },
  },
  {
    title: "כתבים",
    href: "/writings",
    icon: <BookOpen className="w-6 h-6" />,
    color: {
      border: "hover:border-teal-200",
      dot: "bg-teal-400",
      link: "text-teal-700",
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
    <section className="p-8 md:p-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Playlists */}
        <ContentCard section={SECTIONS[0]}>
          <ul className="space-y-4 mb-8">
            {(playlists as Playlist[]).map((playlist) => (
              <li key={playlist.id}>
                <Link
                  href={`/playlists/${playlist.slug}`}
                  className="flex items-center gap-3 text-foreground/80 hover:text-blue-600 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="font-medium">{playlist.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </ContentCard>

        {/* Blog */}
        <ContentCard section={SECTIONS[1]}>
          <ul className="space-y-4 mb-8">
            {(blogs as Blog[]).map((blog) => (
              <li key={blog.id}>
                <Link
                  href={`/blog/${blog.slug}`}
                  className="flex flex-col gap-1 group/item"
                >
                  {blog.publishedAt && (
                    <span className="text-sm text-emerald-600 font-medium">
                      {formatDate(blog.publishedAt)}
                    </span>
                  )}
                  <span className="text-foreground font-bold group-hover/item:text-emerald-700 transition-colors">
                    {blog.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </ContentCard>

        {/* Responsa */}
        <ContentCard section={SECTIONS[2]}>
          <ul className="space-y-4 mb-8">
            {responsas.map((responsa) => (
              <li
                key={responsa.id}
                className="p-3 bg-card rounded shadow-sm text-foreground/80 font-medium border-r-4 border-orange-400"
              >
                <Link
                  href={`/responsa/${responsa.slug}`}
                  className="hover:text-orange-600 transition-colors"
                >
                  {responsa.title}
                </Link>
              </li>
            ))}
          </ul>
        </ContentCard>

        {/* Writings */}
        <ContentCard section={SECTIONS[3]}>
          <ul className="space-y-4 mb-8">
            {writings.map((writing) => (
              <li key={writing.id}>
                <Link
                  href={`/writings/${writing.slug}`}
                  className="flex items-center justify-between group/file"
                >
                  <span className="text-foreground font-bold group-hover/file:text-teal-700 transition-colors">
                    {writing.title}
                  </span>
                  <FileText className="w-5 h-5 text-teal-600/50" />
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
      className={`group p-6 rounded-xl border border-border ${section.color.border} transition-all hover:shadow-md bg-muted/30`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-12 h-12 rounded-lg ${section.color.iconBg} flex items-center justify-center text-white shadow-inner`}
        >
          {section.icon}
        </div>
        <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
      </div>
      {children}
      <Link
        href={section.href}
        className={`inline-flex items-center ${section.color.link} font-bold hover:gap-2 transition-all`}
      >
        צפה בהכל
        <ChevronLeft className="w-4 h-4 ms-1" aria-hidden="true" />
      </Link>
    </div>
  );
}
