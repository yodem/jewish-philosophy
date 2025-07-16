'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const BackButton: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow transition-colors ${className || ''}`}
      type="button"
    >
      <span aria-hidden="true">&#8592;</span> Back
    </button>
  );
};

export default BackButton; 