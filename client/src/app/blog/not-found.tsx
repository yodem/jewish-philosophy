import ContentNotFound from '@/components/shared/ContentNotFound';

export default function BlogNotFound() {
  return (
    <ContentNotFound
      title="הפוסט לא נמצא"
      description="הפוסט שחיפשתם אינו קיים או שהוסר מהאתר. ייתכן שהקישור שגוי או שהפוסט עבר לכתובת אחרת."
      backLabel="חזרה לבלוג"
      backHref="/blog"
      breadcrumbParent={{ label: "בלוג", href: "/blog" }}
    />
  );
}
