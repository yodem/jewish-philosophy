import { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { generateMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "צור קשר | פילוסופיה יהודית",
  description: "יש לך שאלה או משוב? צור קשר עם צוות פילוסופיה יהודית. אנו כאן כדי לעזור לך בלימוד התורה והפילוסופיה היהודית.",
  url: "/contact",
  type: "website",
  keywords: "צור קשר, פילוסופיה יהודית, שאלות, משוב, תמיכה, ייעוץ, לימוד תורה, פילוסופיה דתית",
});

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">צור קשר</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          יש לך שאלה על התכנים? רוצה להציע שיתוף פעולה? או שיש לך משוב חשוב?
          אנו כאן כדי לשמוע ממך ולעזור בכל דרך אפשרית.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
