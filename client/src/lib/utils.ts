import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Strips markdown syntax and counts words to estimate reading time.
// Uses 200 wpm, appropriate for Hebrew content.
export function calculateReadingTime(content: string): number {
  const text = content
    .replace(/```[\s\S]*?```/g, '') // fenced code blocks
    .replace(/`[^`]*`/g, '')        // inline code
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[.*?\]\(.*?\)/g, '$1') // links → keep text
    .replace(/#{1,6}\s/g, '')        // headings
    .replace(/[*_~>|-]/g, '')        // bold, italic, blockquote, table chars
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
