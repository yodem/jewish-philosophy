import ErrorBoundary from "@/components/ErrorBoundary";
import { getHomePage } from "@/data/loaders";
import { Suspense } from "react";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import HeroSection from "@/components/blocks/HeroSection";
import HomeContentGrid from "@/components/HomeContentGrid";
import HomeContentGridSkeleton from "@/components/HomeContentGridSkeleton";
import HomePageClient from "./HomePageClient";
import type { Block, HeroSectionProps } from "@/types";

export const metadata: Metadata = generateMetadata({
  title: "בית | שלום צדיק - פילוסופיה דתית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה דתית",
  url: "/",
  type: "website",
  keywords: "פילוסופיה דתית, פילוסופיה דתית, הרמב\"ם, בחירה חופשית, ידיעת האל, השגחה, טעמי המצוות, מוסר הרמב\"ם, דרך האמצע, נבל ברשות התורה, הוכחה לקיום האל, מהות האל, הכרחי המציאות, טרנסצנדנטיות האל, ביקורת החילון, יהדות רציונלית, דטרמיניזם, הגלגלים בפילוסופיה, מושגים בפילוסופיה דתית, מבוא לפילוסופיה דתית, על-טבעי ביהדות, חילון ליברלי, קיום מצוות, רוח החוק, סכלים נבדלים, אמת מהותית, השגה שכלית, תורה מן השמיים, הגדרת דת, הגדרת פילוסופיה, פילוסופיה דתית מתונה, פילוסופיה דתית רדיקלית, ספקות דתיות, אחדות האל, שכר ועונש, רבי יהודה הלוי, רבי סעדיה גאון, אריסטו, אבן רושד, מורה נבוכים, משנה תורה, שמונה פרקים, הלכות יסודי התורה, הלכות דעות, כוזרי, שלום צדיק, סדרות שיעורים, שיעורי וידאו, קורסים יהודיים, לימוד ברצף",
});

export default async function HomeRoute() {
  const homeRes = await getHomePage();
  const blocks: Block[] = homeRes?.data?.blocks || [];

  // Extract the hero block from CMS data
  const heroBlock = blocks.find(
    (b): b is HeroSectionProps => b.__component === "blocks.hero-section"
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
      {/* Hero Section */}
      <ErrorBoundary>
        {heroBlock ? (
          <HeroSection data={heroBlock} />
        ) : (
          <section className="relative p-8 md:p-16 text-center border-b border-border">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                ברוכים הבאים ללימוד פילוסופיה דתית
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                מרכז הידע וההגות להעמקה ביסודות המחשבה היהודית, מחקר פילוסופי וחיבור בין עולם המעשה לעולם הרוח.
              </p>
            </div>
          </section>
        )}
      </ErrorBoundary>

      {/* 2x2 Content Grid */}
      <ErrorBoundary>
        <Suspense fallback={<HomeContentGridSkeleton />}>
          <HomeContentGrid />
        </Suspense>
      </ErrorBoundary>

      {/* Newsletter */}
      <HomePageClient />
    </div>
  );
}
