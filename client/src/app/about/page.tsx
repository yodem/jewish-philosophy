import { Metadata } from "next";
import { getPageBySlug } from "@/data/loaders";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import QuestionFormWrapper from "@/components/QuestionFormWrapper";
import { generateMetadata } from "@/lib/metadata";

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
  
  // If no data is available yet, show a placeholder
  if (!data) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">אודות</h1>
        <p className="text-center text-gray-500">
          התוכן לא זמין כרגע. אנא נסו שנית מאוחר יותר.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BlockRenderer blocks={blocks} />
    </div>
  );
} 