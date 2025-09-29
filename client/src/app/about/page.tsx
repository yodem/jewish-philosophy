import { Metadata } from "next";
import { getPageBySlug } from "@/data/loaders";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMetadata } from "@/lib/metadata";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = generateMetadata({
  title: "אודות | פילוסופיה יהודית - החזון והמשימה שלנו",
  description: "פילוסופיה יהודית הוא פלטפורמה מובילה ללימוד יהודי מקוון. הכירו את החזון, הצוות והערכים שמנחים אותנו במטרה להנגיש את אוצרות התורה לכל בית יהודי.",
  url: "/about",
  type: "website",
  keywords: "שלום צדיק, פילוסופיה יהודית, פילוסופיה דתית, הרמב\"ם, מורה נבוכים, חזון, ערכי יהדות, הנגשת תורה, פילוסופיה דתית מתונה, מבוא לפילוסופיה יהודית",
});

function LoadingFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Skeleton className="w-32 h-32 rounded-full bg-blue-200" />
    </div>
  );
}

export default async function AboutPage() {
  const pageRes = await getPageBySlug("about");
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];

  // If no data is available yet, show a placeholder
  if (!data) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Breadcrumbs
          items={[
            { label: "בית", href: "/" },
            { label: "אודות" }
          ]}
        />
        <h1 className="text-3xl font-bold mb-8 text-center">אודות</h1>
        <p className="text-center text-gray-500">
          התוכן לא זמין כרגע. אנא נסו שנית מאוחר יותר.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "בית", href: "/" },
          { label: "אודות" }
        ]}
      />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <BlockRenderer blocks={blocks} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 