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
    siteName: 'פילוסופיה יהודית',
    siteDescription: 'פלטפורמה מובילה ללימוד יהודי מקוון - שיעורים, ספרים, מאמרים ושאלות ותשובות. גלו תכנים איכותיים בהלכה, אגדה, פילוסופיה יהודית ועוד.',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://beit-midrash-digital.com',
    keywords: [
      'פילוסופיה יהודית',
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
      'מושגים בפילוסופיה יהודית',
      'מבוא לפילוסופיה יהודית',
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
    'פילוסופיה יהודית',
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
    'מושגים בפילוסופיה יהודית',
    'מבוא לפילוסופיה יהודית',
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
    blog: ['מאמרי הלכה', 'פרשת השבוע', 'דברי תורה', 'מאמרים רבניים', 'חידושי תורה'],
    video: ['שיעורי וידאו', 'הרצאות', 'לימוד מקוון', 'שיעור וידאו'],
    playlist: ['סדרת שיעורים', 'קורס מקוון', 'לימוד ברצף', 'שיעורים מובנים'],
    writing: ['ספר יהודי', 'מאמר יהודי', 'כתבי עת', 'ספרות יהודית'],
    responsa: ['שאלות ותשובות', 'פסיקה הלכתית', 'הלכה פסוקה', 'תשובות רבניות']
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beit-midrash-digital.com';
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