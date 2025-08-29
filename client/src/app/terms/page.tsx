import { getPageBySlug } from "@/data/loaders";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import ErrorBoundary from "@/components/ErrorBoundary";
import TermsPageClient from "./TermsPageClient";

export const metadata: Metadata = generateMetadata({
  title: "מושגים | פילוסופיה יהודית - מושגים ומונחים",
  description: "אוסף מושגים בפילוסופיה יהודית, הלכה ומחשבת ישראל. מילון מושגים עם הסברים מפורטים מאת רבנים וחוקרים מובילים.",
  url: "/terms",
  type: "website",
  keywords: "מושגים פילוסופיה יהודית, מילון מושגים, מונחים יהודיים, הרמב״ם, הלכה, אגדה, מחשבת ישראל, פילוסופיה דתית, מורה נבוכים, משנה תורה, כוזרי",
});

export default async function TermsPage() {
  const pageRes = await getPageBySlug("terms");
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];

  return (
    <ErrorBoundary>
      <TermsPageClient blocks={blocks} />
    </ErrorBoundary>
  );
}


