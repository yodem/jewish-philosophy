import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";
import { Metadata } from "next";

/**
 * Strapi v5 SEO utilities following the article best practices
 * Implements proper populate patterns and SEO-focused content fetching
 */

export interface StrapiV5SEOField {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  metaRobots?: string;
  structuredData?: Record<string, unknown>;
  metaViewport?: string;
  canonicalURL?: string;
  metaImage?: {
    data?: {
      attributes: {
        url: string;
        alternativeText?: string;
        width?: number;
        height?: number;
      };
    };
  };
}

export interface StrapiV5SEOContent {
  id: number;
  documentId: string;
  attributes: {
    title: string;
    content?: string;
    description?: string;
    slug: string;
    seo?: StrapiV5SEOField;
    publishedAt: string;
    updatedAt: string;
    [key: string]: unknown;
  };
}

/**
 * Enhanced SEO query builder for Strapi v5
 * Follows the populate pattern mentioned in the article notes
 */
export const buildSEOQuery = (additionalFields: string[] = []) => {
  return qs.stringify({
    populate: {
      seo: {
        populate: {
          metaImage: {
            populate: '*'
          },
          metaSocial: {
            populate: '*'
          },
          keywords: true,
          structuredData: true
        }
      },
      author: {
        populate: {
          avatar: true
        }
      },
      categories: {
        populate: '*'
      },
      coverImage: {
        populate: '*'
      },
      ...additionalFields.reduce((acc, field) => {
        acc[field] = { populate: '*' };
        return acc;
      }, {} as Record<string, unknown>)
    }
  });
};

/**
 * Fetch SEO-optimized content from Strapi v5
 * Example implementation from the article notes
 */
export async function fetchSEOContent(
  endpoint: string, 
  slug?: string,
  additionalFields: string[] = []
): Promise<StrapiV5SEOContent | null> {
  try {
    const query = slug 
      ? qs.stringify({
          filters: { slug: { $eq: slug } },
          ...JSON.parse(buildSEOQuery(additionalFields).replace('populate=', ''))
        })
      : buildSEOQuery(additionalFields);

    const path = `/api/${endpoint}${slug ? '' : 's'}`;
    const url = new URL(path, BASE_URL);
    url.search = query;

    const response = await fetchAPI(url.href, { method: "GET" });
    
    if (slug) {
      return response.data?.[0] || null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching SEO content from ${endpoint}:`, error);
    return null;
  }
}

/**
 * Convert Strapi v5 SEO fields to Next.js Metadata
 * Implements the dynamic metadata pattern from the article
 */
export function strapiSEOToMetadata(
  content: StrapiV5SEOContent,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://beit-midrash-digital.com'
): Metadata {
  const { attributes } = content;
  const seo = attributes.seo;
  
  // Use SEO fields if available, fallback to content fields
  const title = seo?.metaTitle || attributes.title;
  const description = seo?.metaDescription || attributes.description || 
    (typeof attributes.content === 'string' ? attributes.content.slice(0, 160) : '');
  
  const canonical = seo?.canonicalURL || `${baseUrl}/${attributes.slug}`;
  const keywords = seo?.keywords || '';
  
  // Enhanced image handling for SEO
  const imageUrl = seo?.metaImage?.data?.attributes?.url || 
    (attributes.coverImage as { data?: { attributes?: { url?: string } } })?.data?.attributes?.url;
  const imageAlt = seo?.metaImage?.data?.attributes?.alternativeText || 
    `${title} - פילוסופיה יהודית`;
  const imageWidth = seo?.metaImage?.data?.attributes?.width || 1200;
  const imageHeight = seo?.metaImage?.data?.attributes?.height || 630;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'פילוסופיה יהודית',
      locale: 'he_IL',
      type: 'article',
      publishedTime: attributes.publishedAt,
      modifiedTime: attributes.updatedAt,
      images: imageUrl ? [{
        url: imageUrl.startsWith('http') ? imageUrl : `${process.env.STRAPI_BASE_URL || BASE_URL}${imageUrl}`,
        width: imageWidth,
        height: imageHeight,
        alt: imageAlt,
      }] : undefined,
    },
    robots: seo?.metaRobots || {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      ...(seo?.metaViewport && { viewport: seo.metaViewport })
    }
  };
}

/**
 * Generate structured data from Strapi v5 SEO fields
 * Implements JSON-LD pattern from the article notes
 */
export function generateStrapiStructuredData(
  content: StrapiV5SEOContent,
  type: 'Article' | 'WebPage' | 'Course' | 'VideoObject' = 'Article'
): Record<string, unknown> {
  const { attributes } = content;
  const seo = attributes.seo;
  
  // Use custom structured data if provided, otherwise generate
  if (seo?.structuredData && typeof seo.structuredData === 'object') {
    return seo.structuredData;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beit-midrash-digital.com';
  const url = `${baseUrl}/${attributes.slug}`;
  const imageUrl = seo?.metaImage?.data?.attributes?.url || 
    (attributes.coverImage as { data?: { attributes?: { url?: string } } })?.data?.attributes?.url;

  const baseStructure: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    "headline": attributes.title,
    "description": attributes.description || (typeof attributes.content === 'string' ? attributes.content.slice(0, 160) : ''),
    "url": url,
    "datePublished": attributes.publishedAt,
    "dateModified": attributes.updatedAt,
    "inLanguage": "he-IL",
    "isAccessibleForFree": true,
    ...(imageUrl && {
      "image": [{
        "@type": "ImageObject",
        "url": imageUrl.startsWith('http') ? imageUrl : `${process.env.STRAPI_BASE_URL || BASE_URL}${imageUrl}`,
        "width": seo?.metaImage?.data?.attributes?.width || 1200,
        "height": seo?.metaImage?.data?.attributes?.height || 630
      }]
    }),
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "פילוסופיה יהודית",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  // Add author if available
  if (attributes.author && typeof attributes.author === 'object') {
    const author = attributes.author as { name?: string; data?: { attributes?: { name?: string } }; url?: string };
    baseStructure['author'] = {
      "@type": "Person",
      "name": author.name || author.data?.attributes?.name,
      ...(author.url && { "url": author.url })
    };
  }

  // Add categories/keywords
  if (attributes.categories && Array.isArray(attributes.categories)) {
    const categories = attributes.categories as Array<{ name?: string; data?: { attributes?: { name?: string } } }>;
    baseStructure['keywords'] = categories.map(cat => 
      cat.name || cat.data?.attributes?.name
    ).filter(Boolean).join(', ');
  }

  return baseStructure;
}

/**
 * Bulk fetch SEO data for sitemap generation
 * Optimized for performance as mentioned in the article
 */
export async function fetchAllSEOContent(
  contentTypes: string[] = ['blogs', 'writings', 'playlists', 'responsas']
): Promise<Record<string, StrapiV5SEOContent[]>> {
  try {
    const queries = contentTypes.map(async (type) => {
      const query = qs.stringify({
        populate: {
          seo: {
            populate: ['canonicalURL']
          }
        },
        fields: ['slug', 'title', 'publishedAt', 'updatedAt'],
        pagination: {
          pageSize: 100 // Adjust based on your content volume
        }
      });

      const path = `/api/${type}`;
      const url = new URL(path, BASE_URL);
      url.search = query;

      const response = await fetchAPI(url.href, { method: "GET" });
      return { [type]: response.data || [] };
    });

    const results = await Promise.all(queries);
    return results.reduce((acc, result) => ({ ...acc, ...result }), {});
  } catch (error) {
    console.error('Error fetching bulk SEO content:', error);
    return {};
  }
}

/**
 * Validate SEO requirements for content
 * Helps ensure content meets SEO best practices
 */
export function validateSEOContent(content: StrapiV5SEOContent): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const { attributes } = content;
  const seo = attributes.seo;

  // Title validation
  const title = seo?.metaTitle || attributes.title;
  if (!title) {
    errors.push('Missing title');
  } else if (title.length > 60) {
    warnings.push('Title longer than 60 characters');
  } else if (title.length < 10) {
    warnings.push('Title shorter than 10 characters');
  }

  // Description validation
  const description = seo?.metaDescription || attributes.description;
  if (!description) {
    warnings.push('Missing meta description');
  } else if (description.length > 160) {
    warnings.push('Description longer than 160 characters');
  } else if (description.length < 50) {
    warnings.push('Description shorter than 50 characters');
  }

  // Image validation
  const hasImage = seo?.metaImage?.data?.attributes?.url || 
    (attributes.coverImage as { data?: { attributes?: { url?: string } } })?.data?.attributes?.url;
  if (!hasImage) {
    warnings.push('Missing SEO image');
  }

  // Slug validation
  if (!attributes.slug) {
    errors.push('Missing slug');
  } else if (!/^[a-z0-9-]+$/.test(attributes.slug)) {
    warnings.push('Slug contains non-SEO-friendly characters');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
} 