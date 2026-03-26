import type { HeroSectionProps } from "@/types";
import { StrapiImage } from "@/components/shared/StrapiImage";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function HeroSection({ data }: { data?: HeroSectionProps }) {
  const heading =
    data?.heading ?? "מרכז המחקר לפילוסופיה יהודית";

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-primary to-primary/80 dark:from-card dark:to-card/80 px-6 py-16 text-center md:px-16 md:py-24"
      aria-label="באנר ראשי"
    >
      {/* Background image from CMS (decorative, faded) */}
      {data?.image && (
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <StrapiImage
            src={data.image.url}
            alt=""
            width={1200}
            height={800}
            className="h-full w-full object-cover"
            fill
            priority
          />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold leading-tight text-primary-foreground dark:text-foreground md:text-6xl">
          {heading}
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-primary-foreground/80 dark:text-foreground/70 md:text-xl">
          העמקה ביסודות המחשבה היהודית — מחקר פילוסופי, טקסטים מקוריים
          וסדרות שיעורים אקדמיות.
        </p>

        {data?.cta ? (
          <Link
            href={data.cta.href}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 font-bold text-white shadow-md transition-colors hover:bg-accent/80 active:scale-[0.97]"
          >
            <GraduationCap className="size-5" aria-hidden="true" />
            {data.cta.text}
          </Link>
        ) : (
          <Link
            href="/playlists"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-4 font-bold text-white shadow-md transition-colors hover:bg-accent/80 active:scale-[0.97]"
          >
            <GraduationCap className="size-5" aria-hidden="true" />
            לסדרות השיעורים
          </Link>
        )}
      </div>
    </section>
  );
}
