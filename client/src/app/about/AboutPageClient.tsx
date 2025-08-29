"use client";

import dynamic from "next/dynamic";

// Dynamic import for QuestionFormWrapper component
const QuestionFormWrapper = dynamic(() => import("@/components/QuestionFormWrapper"), {
  loading: () => (
    <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-8 shadow-sm animate-pulse h-64"></div>
  )
});

export default function AboutPageClient() {
  return (
    <div className="max-w-3xl mx-auto mt-12">
      <QuestionFormWrapper />
    </div>
  );
}
