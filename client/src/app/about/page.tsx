import { Metadata } from "next";
import { getPageBySlug } from "@/data/loaders";
import BlockRenderer from "@/components/home/BlockRenderer";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMetadata } from "@/lib/metadata";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import DonateButton from "@/components/shared/DonateButton";

export const metadata: Metadata = generateMetadata({
  title: "אודות | שלום צדיק - פילוסופיה דתית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה דתית",
  url: "/about",
  type: "website",
  keywords: "שלום צדיק, פילוסופיה דתית, פילוסופיה דתית, הרמב\"ם, מורה נבוכים, חזון, ערכי יהדות, פילוסופיה דתית מתונה, מבוא לפילוסופיה דתית",
});

function LoadingFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Skeleton className="w-32 h-32 rounded-full" />
    </div>
  );
}

export default async function AboutPage() {
  const pageRes = await getPageBySlug("about");
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: "בית", href: "/" },
            { label: "אודות" }
          ]}
        />
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">אודות</h1>
        <p className="text-center text-muted-foreground">
          התוכן לא זמין כרגע. אנא נסו שנית מאוחר יותר.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
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
      <DonateButton />
    </div>
  );
}
