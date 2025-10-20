import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = generateMetadata({
  title: "צרו קשר | שלום צדיק - פילוסופיה יהודית",
  description: "פלטפורמה מקוונת ללימוד פילוסופיה יהודית",
  url: "/contact",
  type: "website",
  keywords: "צרו קשר, פילוסופיה יהודית, שאלות, משוב, תמיכה, ייעוץ, פילוסופיה דתית",
});

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Breadcrumbs
        items={[
          { label: "בית", href: "/" },
          { label: "צרו קשר" }
        ]}
      />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">צרו קשר</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          יש לכם שאלה על התכנים? רוצים להציע שיתוף פעולה? או שיש לכם משוב חשוב?
          אנו כאן כדי לשמוע מכם ולעזור בכל דרך אפשרית.
        </p>
      </div>

      <ContactPageClient />
    </div>
  );
}
