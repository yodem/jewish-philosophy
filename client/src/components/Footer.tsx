import React from "react";
import Link from "next/link";

export interface FooterLink {
  label: string;
  url: string;
}

export default function Footer({
  copyright,
  links = [],
}: {
  copyright?: string;
  links?: FooterLink[];
}) {
  return (
    <footer className="w-full py-6 mt-12 border-t bg-white text-center text-gray-600">
      <div className="container mx-auto flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          {links.map((link) => (
            <Link key={link.url} href={link.url} className="hover:underline text-blue-600">
              {link.label}
            </Link>
          ))}
        </div>
        {copyright && <div className="text-xs text-gray-400">{copyright}</div>}
      </div>
    </footer>
  );
} 