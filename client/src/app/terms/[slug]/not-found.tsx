import ContentNotFound from '@/components/shared/ContentNotFound';

export default function TermNotFound() {
  return (
    <ContentNotFound
      title="המושג לא נמצא"
      description="המושג שחיפשתם אינו קיים או שהוסר מהאתר. ייתכן שהקישור שגוי או שהמושג עבר לכתובת אחרת."
      backLabel="חזרה לרשימת המושגים"
      backHref="/terms"
      breadcrumbParent={{ label: "מושגים", href: "/terms" }}
    />
  );
}
