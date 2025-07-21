import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto py-20 text-center">
      <h2 className="text-3xl font-bold mb-4">שאלה לא נמצאה</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        לא הצלחנו למצוא את השאלה שחיפשת
      </p>
      <Button asChild>
        <Link href="/responsa">חזרה לשאלות ותשובות</Link>
      </Button>
    </div>
  );
} 