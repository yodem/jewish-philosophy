"use client";

import dynamic from "next/dynamic";

// Dynamic import for WhatsappButton component
const WhatsappButton = dynamic(() => import('../components/WhatsappButton'), {
  loading: () => null // No loading state needed for a fixed button
});

export default function LayoutClient() {
  return <WhatsappButton />;
}
