"use client";

import dynamic from "next/dynamic";
import DonateButton from "@/components/shared/DonateButton";

const Subscribe = dynamic(
  () =>
    import("@/components/forms/Subscribe").then((mod) => mod.Subscribe),
  {
    loading: () => (
      <section className="animate-pulse border-t border-border bg-muted/50 p-8 md:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-2 h-7 w-48 rounded bg-muted" />
          <div className="mx-auto mb-8 h-5 w-80 rounded bg-muted" />
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="h-14 flex-1 rounded-lg bg-muted" />
            <div className="h-14 w-32 rounded-lg bg-muted" />
          </div>
        </div>
      </section>
    ),
  }
);

export default function HomePageClient() {
  return (
    <>
      <Subscribe
        id={1}
        headline="הרשמו לניוזלטר"
        content="קבלו עדכונים על שיעורים חדשים ומאמרי הגות ישירות לאימייל שלכם."
        placeholder="כתובת האימייל שלך"
        buttonText="הרשמה"
      />
      <div className="p-8 md:p-12">
        <DonateButton />
      </div>
    </>
  );
}
