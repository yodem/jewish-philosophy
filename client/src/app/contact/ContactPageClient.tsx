"use client";

import dynamic from "next/dynamic";

// Dynamic import for ContactForm component
const ContactForm = dynamic(() => import("@/components/ContactForm"), {
  loading: () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )
});

export default function ContactPageClient() {
  return <ContactForm />;
}
