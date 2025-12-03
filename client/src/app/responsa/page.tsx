import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import { Suspense } from "react";
import ResponsaPageClient from "./ResponsaPageClient";

export const metadata: Metadata = generateMetadata({
  title: "שאלות ותשובות | שלום צדיק - פילוסופיה דתית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה דתית",
  url: "/responsa",
  type: "website",
  keywords: "שאלות ותשובות, פילוסופיה דתית, פילוסופיה דתית, הרמב\"ם, מורה נבוכים, שלום צדיק",
});

export default function ResponsaPage() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <ResponsaPageClient />
    </Suspense>
  );
}
