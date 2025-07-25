import { Metadata } from "next";
import { getPageBySlug } from "@/data/loaders";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import QuestionFormWrapper from "@/components/QuestionFormWrapper";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about our team and mission",
};

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
      <div className="mt-16 max-w-3xl mx-auto">
        <QuestionFormWrapper />
      </div>
    </div>
  );
} 