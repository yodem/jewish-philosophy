import ContentNotFound from '@/components/shared/ContentNotFound';

export default function AboutNotFound() {
  return (
    <ContentNotFound
      title="העמוד לא נמצא"
      description="העמוד שחיפשתם אינו קיים או שהוסר מהאתר. ייתכן שהקישור שגוי או שהעמוד עבר לכתובת אחרת."
      backLabel="חזרה לעמוד הבית"
      backHref="/"
      breadcrumbParent={{ label: "אודות", href: "/about" }}
    />
  );
}
