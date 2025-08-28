import { getPageBySlug } from "@/data/loaders";
import { Metadata } from "next";
import { generateMetadata, generateStructuredData } from "@/lib/metadata";
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  // Structured data for the terms collection
  const termsCollectionStructuredData = generateStructuredData({
    type: 'WebPage',
    name: 'מושגים פילוסופיה יהודית - מילון מושגים ומונחים',
    description: 'אוסף מושגים בפילוסופיה יהודית, הלכה ומחשבת ישראל. מילון מושגים עם הסברים מפורטים מאת רבנים וחוקרים מובילים.',
    url: `${baseUrl}/terms`,
    additionalProperties: {
      "mainEntity": {
        "@type": "CollectionPage",
        "name": "מושגים פילוסופיה יהודית",
        "description": "פלטפורמה למפגש עם מושגי היסוד של הפילוסופיה היהודית, הלכה ומחשבת ישראל",
        "url": `${baseUrl}/terms`,
        "inLanguage": "he-IL",
        "about": [
          {
            "@type": "Thing",
            "name": "פילוסופיה יהודית",
            "description": "מחשבת ישראל ופילוסופיה יהודית"
          },
          {
            "@type": "Thing",
            "name": "הלכה יהודית",
            "description": "לימוד ופסיקה הלכתית"
          },
          {
            "@type": "Thing",
            "name": "מושגי יסוד",
            "description": "מונחים בסיסיים במחשבה היהודית"
          }
        ]
      }
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsCollectionStructuredData) }}
      />
      <TermsPageClient blocks={blocks} />
    </>
  );
}


