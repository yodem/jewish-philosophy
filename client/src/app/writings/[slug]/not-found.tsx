import ContentNotFound from '@/components/shared/ContentNotFound';

export default function WritingNotFound() {
  return (
    <ContentNotFound
      title="הכתב לא נמצא"
      description="הכתב שחיפשתם אינו קיים או שהוסר מהאתר. ייתכן שהקישור שגוי או שהכתב עבר לכתובת אחרת."
      backLabel="חזרה לרשימת הכתבים"
      backHref="/writings"
      breadcrumbParent={{ label: "כתבים", href: "/writings" }}
    />
  );
}
