"use client";

import dynamic from "next/dynamic";

const WhatsappButton = dynamic(() => import('@/components/shared/WhatsappButton'), {
  loading: () => null
});

export default function LayoutClient() {
  return <WhatsappButton />;
}
