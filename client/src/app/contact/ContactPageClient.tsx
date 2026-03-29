"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ContactForm = dynamic(() => import("@/components/forms/ContactForm"), {
  loading: () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-1/2" />
      </div>
    </div>
  )
});

export default function ContactPageClient() {
  return <ContactForm />;
}
