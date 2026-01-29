import { getGlobalSettings } from '@/data/loaders';
import { generateMetadata, SEOData } from '@/lib/metadata';
import { Metadata } from 'next';

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  keywords: string[];
  socialMedia?: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
  };
}

let cachedSiteConfig: SiteConfig | null = null;

export async function getSiteConfig(): Promise<SiteConfig> {
  // Return cached config if available
  if (cachedSiteConfig) {
    return cachedSiteConfig;
  }

  // Default fallback config
  const defaultConfig: SiteConfig = {
    siteName: 'שלום צדיק - פילוסופיה דתית',
    siteDescription: 'פלטפורמה מקוונת ללימוד פילוסופיה דתית',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/',
    keywords: [
      'פילוסופיה דתית',
      'פילוסופיה דתית',
      'הרמב"ם',
      'בחירה חופשית',
      'ידיעת האל',
      'השגחה',
      'טעמי המצוות',
      'מוסר הרמב"ם',
      'דרך האמצע',
      'נבל ברשות התורה',
      'הוכחה לקיום האל',
      'מהות האל',
      'הכרחי המציאות',
      'טרנסצנדנטיות האל',
      'ביקורת החילון',
      'יהדות רציונלית',
      'דטרמיניזם',
      'הגלגלים בפילוסופיה',
      'מושגים בפילוסופיה דתית',
      'מבוא לפילוסופיה דתית',
      'על-טבעי ביהדות',
      'חילון ליברלי',
      'קיום מצוות',
      'רוח החוק',
      'סכלים נבדלים',
      'אמת מהותית',
      'השגה שכלית',
      'תורה מן השמיים',
      'הגדרת דת',
      'הגדרת פילוסופיה',
      'פילוסופיה דתית מתונה',
      'פילוסופיה דתית רדיקלית',
      'ספקות דתיות',
      'אחדות האל',
      'שכר ועונש',
      'רבי יהודה הלוי',
      'רבי סעדיה גאון',
      'אריסטו',
      'אבן רושד',
      'מורה נבוכים',
      'משנה תורה',
      'שמונה פרקים',
      'הלכות יסודי התורה',
      'הלכות דעות',
      'כוזרי',
      'שלום צדיק',
      'סדרות שיעורים',
      'שיעורי וידאו',
      'קורסים יהודיים',
      'לימוד ברצף'
    ]
  };

  try {
    // Fetch global settings from Strapi
    const globalSettings = await getGlobalSettings();
    
    if (globalSettings?.data) {
      const data = globalSettings.data;
      
      // Enhanced config with Strapi data
      const strapiConfig: SiteConfig = {
        siteName: data.title || defaultConfig.siteName,
        siteDescription: data.description || defaultConfig.siteDescription,
        siteUrl: defaultConfig.siteUrl,
        keywords: defaultConfig.keywords, // Can be enhanced from categories later
        socialMedia: {
          // Add social media URLs from header if available
        }
      };
      
      cachedSiteConfig = strapiConfig;
      return strapiConfig;
    }
  } catch (error) {
    console.warn('Failed to fetch global settings for SEO, using defaults:', error);
  }

  // Cache and return default config
  cachedSiteConfig = defaultConfig;
  return defaultConfig;
}

export function getCommonKeywords(): string[] {
  return [
    'פילוסופיה דתית',
    'פילוסופיה דתית',
    'הרמב"ם',
    'בחירה חופשית',
    'ידיעת האל',
    'השגחה',
    'טעמי המצוות',
    'מוסר הרמב"ם',
    'דרך האמצע',
    'נבל ברשות התורה',
    'הוכחה לקיום האל',
    'מהות האל',
    'הכרחי המציאות',
    'טרנסצנדנטיות האל',
    'ביקורת החילון',
    'יהדות רציונלית',
    'דטרמיניזם',
    'הגלגלים בפילוסופיה',
    'מושגים בפילוסופיה דתית',
    'מבוא לפילוסופיה דתית',
    'על-טבעי ביהדות',
    'חילון ליברלי',
    'קיום מצוות',
    'רוח החוק',
    'סכלים נבדלים',
    'אמת מהותית',
    'השגה שכלית',
    'תורה מן השמיים',
    'הגדרת דת',
    'הגדרת פילוסופיה',
    'פילוסופיה דתית מתונה',
    'פילוסופיה דתית רדיקלית',
    'ספקות דתיות',
    'אחדות האל',
    'שכר ועונש',
    'רבי יהודה הלוי',
    'רבי סעדיה גאון',
    'אריסטו',
    'אבן רושד',
    'מורה נבוכים',
    'משנה תורה',
    'שמונה פרקים',
    'הלכות יסודי התורה',
    'הלכות דעות',
    'כוזרי',
    'שלום צדיק',
    'סדרות שיעורים',
    'שיעורי וידאו',
    'קורסים יהודיים',
    'לימוד ברצף'
  ];
}

export function generateContextualKeywords(
  contentType: 'blog' | 'video' | 'playlist' | 'writing' | 'responsa',
  categories?: string[],
  customKeywords?: string[]
): string {
  const baseKeywords = getCommonKeywords();
  
  const typeSpecificKeywords = {
    blog: ['מאמרי פילוסופיה', 'פרשת השבוע', 'דברי תורה', 'מאמרים', 'חידושי תורה'],
    video: ['שיעורי וידאו', 'הרצאות', 'לימוד מקוון', 'שיעור וידאו'],
    playlist: ['סדרת שיעורים', 'קורס מקוון', 'לימוד ברצף', 'שיעורים מובנים'],
    writing: ['ספר יהודי', 'מאמר יהודי', 'כתבי עת', 'ספרות יהודית'],
    responsa: ['שאלות ותשובות', 'תשובות', 'שאלות בפילוסופיה']
  };

  const allKeywords = [
    ...baseKeywords.slice(0, 6), // First 6 base keywords
    ...typeSpecificKeywords[contentType],
    ...(categories || []),
    ...(customKeywords || [])
  ];

  return [...new Set(allKeywords)].join(', ');
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      ...(crumb.url && { "item": crumb.url })
    }))
  };
}

export interface GenerateSEOMetadataParams {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  keywords?: string[];
}

export function generateSEOMetadata(params: GenerateSEOMetadataParams): Metadata {
  const {
    title,
    description,
    path = '',
    image,
    type = 'article',
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags,
    keywords
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/';
  const url = path ? `${baseUrl}${path}` : baseUrl;
  
  // Generate contextual keywords
  const allKeywords = [
    ...getCommonKeywords().slice(0, 10), // First 10 base keywords
    ...(keywords || []),
    ...(tags || []),
    ...(section ? [section] : [])
  ];

  const seoData: SEOData = {
    title,
    description,
    url,
    image,
    type,
    publishedTime,
    modifiedTime,
    authors,
    tags,
    keywords: [...new Set(allKeywords)].join(', '),
    locale: 'he_IL'
  };

  return generateMetadata(seoData);
}

/**
 * Extracts plain text from markdown content
 * Removes markdown syntax and returns clean text
 */
export function extractTextFromMarkdown(markdown: string, maxLength: number = 160): string {
  if (!markdown) return '';

  // Remove markdown links but keep the text: [text](url) -> text
  let text = markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images: ![alt](url) -> ''
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // Remove headers: ### Header -> Header
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold/italic: **text** or *text* -> text
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');

  // Remove strikethrough: ~~text~~ -> text
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // Remove code blocks: ```code``` -> ''
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove inline code: `code` -> code
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Remove blockquotes: > text -> text
  text = text.replace(/^>\s+/gm, '');

  // Remove list markers: - item or * item or 1. item -> item
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Truncate to maxLength with ellipsis
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim();
    // Try to break at last space to avoid cutting words
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) { // Only if we're not losing too much
      text = text.substring(0, lastSpace);
    }
    text += '...';
  }

  return text;
}

/**
 * Extracts the question from responsa content
 * Assumes question is in the first paragraph or before first line break
 */
export function extractQuestionFromResponsa(content: string, maxLength: number = 160): string {
  if (!content) return 'שאלה ותשובה בפילוסופיה דתית';

  // Split by double newline (paragraph break)
  const paragraphs = content.split(/\n\n+/);

  if (paragraphs.length > 0) {
    // Extract text from first paragraph
    return extractTextFromMarkdown(paragraphs[0], maxLength);
  }

  // Fallback to extracting from full content
  return extractTextFromMarkdown(content, maxLength);
}

/** Truncate text for OG image display (single line or multi-line safe) */
export function truncateForOg(text: string, maxChars: number): string {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxChars) return cleaned;
  const cut = cleaned.substring(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  const end = lastSpace > maxChars * 0.6 ? lastSpace : maxChars;
  return cut.substring(0, end).trim() + '...';
}

/** Split truncated text into lines for OG image (e.g. max ~40 chars per line) */
export function wrapOgText(text: string, maxPerLine: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if (current.length + w.length + 1 <= maxPerLine) {
      current = current ? current + ' ' + w : w;
    } else {
      if (current) lines.push(current);
      current = w.length > maxPerLine ? w.substring(0, maxPerLine) + '...' : w;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4); // max 4 lines
}

/**
 * Generates a description from blog content
 * Uses the description field if available, otherwise extracts from content
 */
export function generateBlogDescription(blog: { description?: string; content: string }): string {
  if (blog.description && blog.description.trim().length > 0) {
    return blog.description;
  }

  return extractTextFromMarkdown(blog.content, 160);
} 