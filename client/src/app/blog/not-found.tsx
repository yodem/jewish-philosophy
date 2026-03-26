import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BlogNotFound() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">הפוסט לא נמצא</h1>
      <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md">
        מצטערים, לא הצלחנו למצוא את הפוסט שחיפשתם.
      </p>
      <Link href="/blog">
        <Button className="cursor-pointer">חזרה לבלוג</Button>
      </Link>
    </div>
  );
}
