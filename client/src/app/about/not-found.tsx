import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <h2 className="text-3xl font-bold mb-4 text-foreground">העמוד לא נמצא</h2>
      <p className="text-muted-foreground mb-8">
        לא הצלחנו למצוא את העמוד שחיפשת
      </p>
      <Button asChild>
        <Link href="/">חזרה לעמוד הבית</Link>
      </Button>
    </div>
  );
}
