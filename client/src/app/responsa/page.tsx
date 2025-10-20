import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import { Suspense } from "react";
import ResponsaPageClient from "./ResponsaPageClient";

export const metadata: Metadata = generateMetadata({
  title: "שאלות ותשובות | שלום צדיק - פילוסופיה יהודית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה יהודית",
  url: "/responsa",
  type: "website",
  keywords: "שאלות ותשובות, פילוסופיה יהודית, פילוסופיה דתית, הרמב\"ם, מורה נבוכים, שלום צדיק",
});

export default function ResponsaPage() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <ResponsaPageClient />
    </Suspense>
  );
}
