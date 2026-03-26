import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import ErrorBoundary from "@/components/ErrorBoundary";
import TermsPageClient from "./TermsPageClient";

export const metadata: Metadata = generateMetadata({
  title: "מושגים | שלום צדיק - פילוסופיה דתית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה דתית",
  url: "/terms",
  type: "website",
  keywords: "מושגים פילוסופיה דתית, מילון מושגים, מונחים יהודיים, הרמב״ם, מחשבת ישראל, פילוסופיה דתית, מורה נבוכים, משנה תורה, כוזרי",
});

export default async function TermsPage() {
  return (
    <ErrorBoundary>
      <TermsPageClient />
    </ErrorBoundary>
  );
}
