import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";
import { Metadata } from "next";

/**
 * Official Strapi SEO Plugin Integration
 * Reference: https://strapi.io/blog/strapi-seo-plugins
 * 
 * This utility works with the @strapi/plugin-seo data structure
 */

export interface StrapiSEOComponent {
  id: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  metaRobots?: string;
  structuredData?: Record<string, unknown>;
  metaViewport?: string;
  canonicalURL?: string;
  metaImage?: {
    data?: {
      id: number;
      attributes: {
        url: string;
        alternativeText?: string;
        width?: number;
        height?: number;
        name: string;
        mime: string;
      };
    };
  };
  metaSocial?: Array<{
    id: number;
    socialNetwork: 'Facebook' | 'Twitter';
    title?: string;
    description?: string;
    image?: {
      data?: {
        id: number;
        attributes: {
          url: string;
          alternativeText?: string;
          width?: number;
          height?: number;
        };
      };
    };
  }>;
}

export interface ContentWithSEO {
  id: number;
  documentId: string;
  attributes: {
    title: string;
    content?: string;
    description?: string;
    slug: string;
    publishedAt: string;
    updatedAt: string;
    seo?: StrapiSEOComponent;
    author?: {
      data?: {
        id: number;
        attributes: {
          name: string;
          email?: string;
        };
      };
    };
    categories?: {
      data?: Array<{
        id: number;
        attributes: {
          name: string;
          slug: string;
        };
      }>;
    };
    coverImage?: {
      data?: {
        id: number;
        attributes: {
          url: string;
          alternativeText?: string;
          width?: number;
          height?: number;
        };
      };
    };
    [key: string]: unknown;
  };
}

/**
 * Enhanced query builder that includes the official Strapi SEO plugin component
 * Following the plugin's data structure from the article
 */
export const buildSEOPluginQuery = (additionalFields: string[] = []) => {
  return qs.stringify({
    populate: {
      // Official Strapi SEO Plugin component
      seo: {
        populate: {
          metaImage: {
            populate: '*'
          },
          metaSocial: {
            populate: {
              image: {
                populate: '*'
              }
            }
          }
        }
      },
      // Standard content relationships
      author: {
        populate: '*'
      },
      categories: {
        populate: '*'
      },
      coverImage: {
        populate: '*'
      },
      // Additional fields
      ...additionalFields.reduce((acc, field) => {
        acc[field] = { populate: '*' };
        return acc;
      }, {} as Record<string, unknown>)
    }
  });
};

/**
 * Fetch content with SEO plugin data
 */
export async function fetchContentWithSEO(
  endpoint: string, 
  slug?: string,
  additionalFields: string[] = []
): Promise<ContentWithSEO | ContentWithSEO[] | null> {
  try {
    const query = slug 
      ? qs.stringify({
          filters: { slug: { $eq: slug } },
          ...JSON.parse(buildSEOPluginQuery(additionalFields).replace('populate=', ''))
        })
      : buildSEOPluginQuery(additionalFields);

    const path = `/api/${endpoint}${slug ? '' : 's'}`;
    const url = new URL(path, BASE_URL);
    url.search = query;

    const response = await fetchAPI(url.href, { method: "GET" });
    
    if (slug) {
      return response.data?.[0] || null;
    }
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching SEO content from ${endpoint}:`, error);
    return null;
  }
}

/**
 * Convert official Strapi SEO plugin data to Next.js Metadata
 * Following the plugin's data structure from the article
 */
export function strapiSEOPluginToMetadata(
  content: ContentWithSEO,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'https://beit-midrash-digital.com'
): Metadata {
  const { attributes } = content;
  const seo = attributes.seo;
  
  // Use SEO plugin fields if available, fallback to content fields
  const title = seo?.metaTitle || attributes.title;
  const description = seo?.metaDescription || attributes.description || 
    (typeof attributes.content === 'string' ? attributes.content.slice(0, 160) : '');
  
  const canonical = seo?.canonicalURL || `${baseUrl}/${attributes.slug}`;
  const keywords = seo?.keywords || '';
  
  // Enhanced image handling using SEO plugin structure
  const metaImageData = seo?.metaImage?.data?.attributes;
  const coverImageData = attributes.coverImage?.data?.attributes;
  const imageUrl = metaImageData?.url || coverImageData?.url;
  const imageAlt = metaImageData?.alternativeText || coverImageData?.alternativeText || 
    `${title} - פילוסופיה יהודית`;
  const imageWidth = metaImageData?.width || coverImageData?.width || 1200;
  const imageHeight = metaImageData?.height || coverImageData?.height || 630;

  // Handle social media meta tags from SEO plugin (no Twitter per user request)
  const facebookMeta = seo?.metaSocial?.find(social => social.socialNetwork === 'Facebook');

  const metadata: Metadata = {
    title,
    description,
    keywords,
    alternates: {
      canonical
    },
    openGraph: {
      title: facebookMeta?.title || title,
      description: facebookMeta?.description || description,
      url: canonical,
      siteName: 'פילוסופיה יהודית',
      locale: 'he_IL',
      type: 'article',
      publishedTime: attributes.publishedAt,
      modifiedTime: attributes.updatedAt,
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
  };

  // Add images to Open Graph
  if (imageUrl) {
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.STRAPI_BASE_URL || BASE_URL}${imageUrl}`;
    metadata.openGraph!.images = [{
      url: fullImageUrl,
      width: imageWidth,
      height: imageHeight,
      alt: imageAlt,
    }];
  }

  // Add viewport from SEO plugin if specified
  if (seo?.metaViewport) {
    metadata.other = {
      viewport: seo.metaViewport
    };
  }

  return metadata;
}

/**
 * Generate structured data using SEO plugin data
 * Incorporates custom structured data from the plugin if available
 */
export function generateSEOPluginStructuredData(
  content: ContentWithSEO,
  type: 'Article' | 'WebPage' | 'Course' | 'VideoObject' = 'Article'
): Record<string, unknown> {
  const { attributes } = content;
  const seo = attributes.seo;
  
  // Use custom structured data from SEO plugin if provided
  if (seo?.structuredData && typeof seo.structuredData === 'object') {
    return seo.structuredData;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beit-midrash-digital.com';
  const url = `${baseUrl}/${attributes.slug}`;
  
  // Get image from SEO plugin or fallback to cover image
  const metaImageData = seo?.metaImage?.data?.attributes;
  const coverImageData = attributes.coverImage?.data?.attributes;
  const imageUrl = metaImageData?.url || coverImageData?.url;

  const baseStructure: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    "headline": seo?.metaTitle || attributes.title,
    "description": seo?.metaDescription || attributes.description || 
      (typeof attributes.content === 'string' ? attributes.content.slice(0, 160) : ''),
    "url": url,
    "datePublished": attributes.publishedAt,
    "dateModified": attributes.updatedAt,
    "inLanguage": "he-IL",
    "isAccessibleForFree": true,
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

  // Add image if available
  if (imageUrl) {
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.STRAPI_BASE_URL || BASE_URL}${imageUrl}`;
    baseStructure["image"] = [{
      "@type": "ImageObject",
      "url": fullImageUrl,
      "width": metaImageData?.width || coverImageData?.width || 1200,
      "height": metaImageData?.height || coverImageData?.height || 630
    }];
  }

  // Add author if available
  if (attributes.author?.data?.attributes) {
    const authorData = attributes.author.data.attributes;
    baseStructure["author"] = {
      "@type": "Person",
      "name": authorData.name,
      ...(authorData.email && { "email": authorData.email })
    };
  }

  // Add categories/keywords
  if (attributes.categories?.data && Array.isArray(attributes.categories.data)) {
    const categoryNames = attributes.categories.data
      .map(cat => cat.attributes.name)
      .filter(Boolean);
    
    if (categoryNames.length > 0) {
      baseStructure["keywords"] = seo?.keywords || categoryNames.join(', ');
    }
  }

  return baseStructure;
}

/**
 * Validate SEO plugin data for compliance with best practices
 * Based on the SEO analysis features mentioned in the article
 */
export function validateSEOPluginContent(content: ContentWithSEO): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  seoScore: number;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const { attributes } = content;
  const seo = attributes.seo;

  let score = 0;
  const maxScore = 100;

  // Title validation (20 points)
  const title = seo?.metaTitle || attributes.title;
  if (!title) {
    errors.push('Missing meta title');
  } else {
    score += 15;
    if (title.length > 60) {
      warnings.push('Meta title longer than 60 characters');
      score -= 5;
    } else if (title.length < 10) {
      warnings.push('Meta title shorter than 10 characters');
      score -= 5;
    } else {
      score += 5;
    }
  }

  // Description validation (20 points)
  const description = seo?.metaDescription || attributes.description;
  if (!description) {
    warnings.push('Missing meta description');
  } else {
    score += 15;
    if (description.length > 160) {
      warnings.push('Meta description longer than 160 characters');
      score -= 5;
    } else if (description.length < 50) {
      warnings.push('Meta description shorter than 50 characters');
      score -= 5;
    } else {
      score += 5;
    }
  }

  // Image validation (15 points)
  const hasMetaImage = seo?.metaImage?.data?.attributes?.url;
  const hasCoverImage = attributes.coverImage?.data?.attributes?.url;
  if (!hasMetaImage && !hasCoverImage) {
    warnings.push('Missing SEO image');
  } else {
    score += 15;
  }

  // Keywords validation (10 points)
  if (seo?.keywords) {
    score += 10;
  } else {
    warnings.push('Missing keywords');
  }

  // Canonical URL validation (10 points)
  if (seo?.canonicalURL) {
    score += 10;
  } else {
    warnings.push('Missing canonical URL');
  }

  // Social media optimization (15 points)
  if (seo?.metaSocial && seo.metaSocial.length > 0) {
    score += 15;
  } else {
    warnings.push('Missing social media meta tags');
  }

  // Structured data validation (10 points)
  if (seo?.structuredData) {
    score += 10;
  } else {
    warnings.push('Missing structured data');
  }

  // Slug validation (bonus)
  if (!attributes.slug) {
    errors.push('Missing slug');
  } else if (!/^[a-z0-9-]+$/.test(attributes.slug)) {
    warnings.push('Slug contains non-SEO-friendly characters');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    seoScore: Math.min(score, maxScore)
  };
} 