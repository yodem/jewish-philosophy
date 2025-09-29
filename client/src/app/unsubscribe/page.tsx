import { Metadata } from 'next';
import Link from 'next/link';
import UnsubscribeForm from '@/components/UnsubscribeForm';

export const metadata: Metadata = {
  title: 'ביטול מנוי | פילוסופיה יהודית',
  description: 'ביטול מנוי מהניוזלטר של פילוסופיה יהודית',
  robots: {
    index: false,
    follow: false
  }
};

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ביטול מנוי מהניוזלטר
          </h1>
          <p className="text-gray-600">
            צר לנו לראות אותך עוזב. הזינו את כתובת האימייל שלכם לביטול המנוי.
          </p>
        </div>
        
        <UnsubscribeForm />
        
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
