'use client';

import dynamic from "next/dynamic";

const QuestionForm = dynamic(() => import("@/components/forms/QuestionForm"), {
  ssr: false,
  loading: () => <div className="w-full bg-muted dark:bg-card rounded-lg p-6 mt-8 shadow-sm animate-pulse h-64" />
});

export default function QuestionFormWrapper() {
  return <QuestionForm />;
}
