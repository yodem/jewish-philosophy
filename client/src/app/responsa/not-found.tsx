import ContentNotFound from '@/components/shared/ContentNotFound';

export default function ResponsaNotFound() {
  return (
    <ContentNotFound
      title="השאלה לא נמצאה"
      description="השאלה שחיפשתם אינה קיימת או שהוסרה מהאתר. ייתכן שהקישור שגוי או שהשאלה עברה לכתובת אחרת."
      backLabel="חזרה לשאלות ותשובות"
      backHref="/responsa"
      breadcrumbParent={{ label: "שאלות ותשובות", href: "/responsa" }}
    />
  );
}
