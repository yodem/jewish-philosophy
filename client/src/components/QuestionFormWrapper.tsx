'use client';

import dynamic from "next/dynamic";

const QuestionForm = dynamic(() => import("@/components/QuestionForm"), {
  ssr: false,
  loading: () => <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-8 shadow-sm animate-pulse h-64"></div>
});

export default function QuestionFormWrapper() {
  return <QuestionForm />;
} 