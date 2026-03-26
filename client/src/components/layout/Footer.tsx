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
    <footer className="w-full py-12 border-t border-border bg-muted dark:bg-card text-sm">
      <div className="flex flex-col md:flex-row-reverse justify-between items-center max-w-7xl mx-auto px-8 gap-8">
        <div className="text-lg font-semibold text-primary dark:text-accent">שלום צדיק</div>
        <nav className="flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              className="text-muted-foreground hover:text-accent underline transition-opacity hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {copyright && (
          <div className="text-muted-foreground">{copyright}</div>
        )}
      </div>
    </footer>
  );
}
