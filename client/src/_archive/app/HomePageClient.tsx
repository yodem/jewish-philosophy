"use client";

import dynamic from "next/dynamic";
import DonateButton from "@/components/DonateButton";

const Subscribe = dynamic(
  () => import("@/components/blocks/Subscribe").then((mod) => mod.Subscribe),
  {
    loading: () => (
      <section className="bg-muted/50 p-8 md:p-12 border-t border-border animate-pulse">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-7 w-48 mx-auto rounded bg-muted mb-2" />
          <div className="h-5 w-80 mx-auto rounded bg-muted mb-8" />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-14 rounded-lg bg-muted" />
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
