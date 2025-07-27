import { Metadata } from "next";
import { getPageBySlug } from "@/data/loaders";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import QuestionFormWrapper from "@/components/QuestionFormWrapper";
import { generateMetadata, generateStructuredData } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "אודות | פילוסופיה יהודית - החזון והמשימה שלנו",
  description: "פילוסופיה יהודית הוא פלטפורמה מובילה ללימוד יהודי מקוון. הכירו את החזון, הצוות והערכים שמנחים אותנו במטרה להנגיש את אוצרות התורה לכל בית יהודי.",
  url: "/about",
  type: "website",
  keywords: "שלום צדיק, פילוסופיה יהודית, פילוסופיה דתית, הרמב\"ם, מורה נבוכים, חזון, ערכי יהדות, הנגשת תורה, פילוסופיה דתית מתונה, מבוא לפילוסופיה יהודית",
});

export default async function AboutPage() {
  const pageRes = await getPageBySlug("about");
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  // Structured data for the about page
  const aboutStructuredData = generateStructuredData({
    type: 'Organization',
    name: 'פילוסופיה יהודית',
    description: 'פילוסופיה יהודית הוא פלטפורמה מובילה ללימוד יהודי מקוון. אנו מאמינים בהנגשת אוצרות התורה והחכמה היהודית לכל בית יהודי.',
    url: `${baseUrl}/about`,
    additionalProperties: {
      "@type": "EducationalOrganization",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`,
      "foundingDate": "2024",
      "description": "מוסד דיגיטלי המתמחה בהוראה ולימוד יהודי מקוון באמצעות טכנולוגיות מתקדמות",
      "mission": "להנגיש את אוצרות התורה והחכמה היהודית לכל מעוניין באמצעות פלטפורמה דיגיטלית מתקדמת",
      "knowsAbout": ["לימודי תורה", "הלכה יהודית", "פילוסופיה יהודית", "אגדה", "תלמוד", "תנך"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "מגוון תכני לימוד",
        "itemListElement": [
          "שיעורי וידאו בגמרא והלכה",
          "מאמרים בפילוסופיה יהודית",
          "שאלות ותשובות הלכתיות",
          "ספרים וכתבי עת יהודיים"
        ]
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["Hebrew", "he"]
      }
    }
  });
  
  // If no data is available yet, show a placeholder
  if (!data) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutStructuredData) }}
        />
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">אודות</h1>
          <p className="text-center text-gray-500">
            התוכן לא זמין כרגע. אנא נסו שנית מאוחר יותר.
          </p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutStructuredData) }}
      />
      <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
        <BlockRenderer blocks={blocks} />
        <div className="mt-16 max-w-3xl mx-auto">
          <QuestionFormWrapper />
        </div>
      </div>
    </>
  );
} 