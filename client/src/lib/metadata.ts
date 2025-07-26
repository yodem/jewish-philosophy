import { Metadata } from 'next';

export interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  keywords?: string;
  locale?: string;
}

export function generateMetadata(seoData: SEOData): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/';
  const siteName = 'פילוסופיה יהודית';
  
  const {
    title,
    description,
    image = `${baseUrl}/og-default.jpg`,
    url = baseUrl,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
    tags,
    keywords,
    locale = 'he_IL'
  } = seoData;

  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const imageUrl = image?.startsWith('http') ? image : `${process.env.STRAPI_BASE_URL || ''}${image}`;

  return {
    title,
    description,
    keywords,
    authors: authors?.map(name => ({ name })),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName,
      locale,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
      ...(tags && { tags }),
    },
    robots: {
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
}

export function generateStructuredData(data: {
  type: 'Article' | 'WebPage' | 'Organization' | 'Video' | 'Book' | 'Course';
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: { name: string };
  publisher?: { name: string; logo?: string };
  keywords?: string;
  inLanguage?: string;
  additionalProperties?: Record<string, unknown>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beit-midrash-digital.com';
  const siteName = 'פילוסופיה יהודית';
  
  const {
    type,
    name,
    description,
    url,
    image,
    datePublished,
    dateModified,
    author,
    publisher,
    keywords,
    inLanguage = 'he-IL',
    additionalProperties = {}
  } = data;

  const baseStructure = {
    "@context": "https://schema.org",
    "@type": type,
    "name": name,
    "description": description,
    "url": url,
    ...(image && { "image": [image] }),
    ...(datePublished && { "datePublished": datePublished }),
    ...(dateModified && { "dateModified": dateModified }),
    ...(author && {
      "author": {
        "@type": "Person",
        "name": author.name,
      }
    }),
    "publisher": {
      "@type": "Organization",
      "name": publisher?.name || siteName,
      "logo": {
        "@type": "ImageObject",
        "url": publisher?.logo || `${baseUrl}/logo.png`
      }
    },
    ...(keywords && { "keywords": keywords }),
    "inLanguage": inLanguage,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    ...additionalProperties
  };

  return baseStructure;
}

export function getImageUrl(strapiImageUrl?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beit-midrash-digital.com';
  
  if (!strapiImageUrl) {
    return `${baseUrl}/og-default.jpg`;
  }
  
  if (strapiImageUrl.startsWith('http')) {
    return strapiImageUrl;
  }
  
  return `${process.env.STRAPI_BASE_URL || ''}${strapiImageUrl}`;
} 