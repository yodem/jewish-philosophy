"use client";

import dynamic from "next/dynamic";

// Dynamic import for Subscribe component
const Subscribe = dynamic(() => import("@/components/blocks/Subscribe").then(mod => mod.Subscribe), {
  loading: () => (
    <div className="w-full max-w-xl mx-auto px-2 py-8 bg-white/95 rounded-2xl shadow-lg flex flex-col items-center gap-6 p-6 mt-8 bg-gradient-to-tl from-zinc-200 via-stone-100 to-white border border-gray-200 animate-pulse">
      <div className="w-full h-32 bg-gray-200 rounded"></div>
    </div>
  )
});

export default function HomePageClient() {
  return (
    <div className="w-full">
      <Subscribe
        id={1}
        headline="הצטרפו אלינו!"
        content="הירשמו לערוץ שלנו וקבלו התראות על תוכן חדש!"
        placeholder="הכניסו את כתובת האימייל שלכם"
        buttonText="הרשמה"
      />
    </div>
  );
}
