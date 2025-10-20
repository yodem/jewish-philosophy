import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import { Suspense } from "react";
import WritingsPageClient from "./WritingsPageClient";

export const metadata: Metadata = generateMetadata({
  title: "כתבים | שלום צדיק - פילוסופיה יהודית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה יהודית",
  url: "/writings",
  type: "website",
  keywords: "כתבים, ספרים יהודיים, מאמרים, פילוסופיה יהודית, פילוסופיה דתית, הרמב\"ם, מורה נבוכים, משנה תורה, כוזרי, שלום צדיק",
});

export default function WritingsPage() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <WritingsPageClient />
    </Suspense>
  );
}
