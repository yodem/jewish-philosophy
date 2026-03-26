import { Metadata } from 'next';
import Link from 'next/link';
import UnsubscribeForm from '@/components/forms/UnsubscribeForm';

export const metadata: Metadata = {
  title: 'ביטול מנוי | פילוסופיה דתית',
  description: 'ביטול מנוי מהניוזלטר של פילוסופיה דתית',
  robots: {
    index: false,
    follow: false
  }
};

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            ביטול מנוי מהניוזלטר
          </h1>
          <p className="text-muted-foreground">
            צר לנו לראות אותך עוזב. הזינו את כתובת האימייל שלכם לביטול המנוי.
          </p>
        </div>

        <UnsubscribeForm />

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-accent hover:text-accent/80 text-sm"
          >
            &#x2190; חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
