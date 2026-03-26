import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { getHomePage } from "@/data/loaders";
import { Suspense } from "react";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import HeroSection from "@/components/home/HeroSection";
import HomeContentGrid from "@/components/home/HomeContentGrid";
import HomeContentGridSkeleton from "@/components/home/HomeContentGridSkeleton";
import HomePageClient from "./HomePageClient";
import BlockRenderer from "@/components/home/BlockRenderer";
import type { Block, HeroSectionProps, InfoBlockProps, SubscribeProps } from "@/types";

export const metadata: Metadata = generateMetadata({
  title: "בית | שלום צדיק - פילוסופיה דתית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה דתית",
  url: "/",
  type: "website",
  keywords:
    'פילוסופיה דתית, הרמב"ם, בחירה חופשית, ידיעת האל, השגחה, טעמי המצוות, מוסר הרמב"ם, דרך האמצע, נבל ברשות התורה, הוכחה לקיום האל, מהות האל, הכרחי המציאות, טרנסצנדנטיות האל, ביקורת החילון, יהדות רציונלית, דטרמיניזם, מושגים בפילוסופיה דתית, מבוא לפילוסופיה דתית, שכר ועונש, רבי יהודה הלוי, רבי סעדיה גאון, אריסטו, אבן רושד, מורה נבוכים, משנה תורה, שמונה פרקים, הלכות יסודי התורה, הלכות דעות, כוזרי, שלום צדיק, סדרות שיעורים, שיעורי וידאו, קורסים יהודיים, לימוד ברצף',
});

export default async function HomeRoute() {
  const homeRes = await getHomePage();
  const blocks: Block[] = homeRes?.data?.blocks ?? [];

  // Extract hero block from CMS data
  const heroBlock = blocks.find(
    (b): b is HeroSectionProps => b.__component === "blocks.hero-section"
  );

  // Remaining blocks (info-blocks, subscribe, etc.) excluding the hero
  const remainingBlocks = blocks.filter(
    (b): b is InfoBlockProps | SubscribeProps =>
      b.__component !== "blocks.hero-section"
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      {/* Hero Section */}
      <ErrorBoundary>
        <HeroSection data={heroBlock} />
      </ErrorBoundary>

      {/* 2x2 Content Grid */}
      <ErrorBoundary>
        <Suspense fallback={<HomeContentGridSkeleton />}>
          <HomeContentGrid />
        </Suspense>
      </ErrorBoundary>

      {/* CMS dynamic blocks (info-blocks, etc.) */}
      {remainingBlocks.length > 0 && (
        <ErrorBoundary>
          <BlockRenderer blocks={remainingBlocks} />
        </ErrorBoundary>
      )}

      {/* Newsletter + Donate */}
      <HomePageClient />

      {/* JSON-LD Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "דף הבית",
                item:
                  process.env.NEXT_PUBLIC_SITE_URL ??
                  "https://religousphilosophy.com/",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
