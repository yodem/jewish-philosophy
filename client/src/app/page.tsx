import BlockRenderer from "@/components/blocks/BlockRenderer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getHomePage } from "@/data/loaders";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = generateMetadata({
  title: "בית | שלום צדיק - פילוסופיה יהודית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה יהודית",
  url: "/",
  type: "website",
  keywords: "פילוסופיה יהודית, פילוסופיה דתית, הרמב\"ם, בחירה חופשית, ידיעת האל, השגחה, טעמי המצוות, מוסר הרמב\"ם, דרך האמצע, נבל ברשות התורה, הוכחה לקיום האל, מהות האל, הכרחי המציאות, טרנסצנדנטיות האל, ביקורת החילון, יהדות רציונלית, דטרמיניזם, הגלגלים בפילוסופיה, מושגים בפילוסופיה יהודית, מבוא לפילוסופיה יהודית, על-טבעי ביהדות, חילון ליברלי, קיום מצוות, רוח החוק, סכלים נבדלים, אמת מהותית, השגה שכלית, תורה מן השמיים, הגדרת דת, הגדרת פילוסופיה, פילוסופיה דתית מתונה, פילוסופיה דתית רדיקלית, ספקות דתיות, אחדות האל, שכר ועונש, רבי יהודה הלוי, רבי סעדיה גאון, אריסטו, אבן רושד, מורה נבוכים, משנה תורה, שמונה פרקים, הלכות יסודי התורה, הלכות דעות, כוזרי, שלום צדיק, סדרות שיעורים, שיעורי וידאו, קורסים יהודיים, לימוד ברצף",
});

function LoadingFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Skeleton className="w-32 h-32 rounded-full bg-blue-200" />
    </div>
  );
}

export default async function HomeRoute() {
  const homeRes = await getHomePage();  
  const blocks = homeRes?.data?.blocks || [];
  
  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <BlockRenderer blocks={blocks} />
        </Suspense>
      </ErrorBoundary>
      <HomePageClient />
    </>
  );
}
