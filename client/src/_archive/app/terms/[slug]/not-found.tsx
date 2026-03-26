import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function TermNotFound() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "בית", href: "/" },
          { label: "מושגים", href: "/terms" },
          { label: "לא נמצא" }
        ]}
      />
      
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted dark:bg-card rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground dark:text-white mb-4">
            המושג לא נמצא
          </h1>
          
          <p className="text-lg text-muted-foreground dark:text-muted-foreground mb-8">
            המושג שחיפשת אינו קיים או שהוסר מהאתר.
            <br />
            ייתכן שהקישור שגוי או שהמושג עבר לכתובת אחרת.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/terms">
              חזרה לרשימת המושגים
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              חזרה לעמוד הבית
            </Link>
          </Button>
        </div>

        <div className="mt-12 p-6 bg-accent/10 dark:bg-blue-950/30 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-primary dark:text-accent">
            עזרה נוספת
          </h2>
          <p className="text-accent/80 dark:text-accent/80 text-sm">
            אם אתם מאמינים שזהו טעות, אנא
            <Link href="/contact" className="underline mx-1">
              צרו קשר
            </Link>
            ונבדוק את הבעיה.
          </p>
        </div>
      </div>
    </div>
  );
}
