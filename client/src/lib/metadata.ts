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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/';
  const siteName = 'שלום צדיק - פילוסופיה דתית';
  
  const {
    title,
    description,
    image,
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
  // Only set image URLs when caller explicitly passes image; otherwise layout's openGraph.images is used (same as /)
  const imageUrl = image !== undefined
    ? (image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL || ''}${image}`)
    : undefined;

  return {
    title,
    description,
    keywords,
    authors: authors?.map(name => ({ name })),
    alternates: {
      canonical: fullUrl,
      languages: {
        'he': fullUrl,
        'he-IL': fullUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName,
      locale,
      type,
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
      }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
      ...(tags && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@shalomtzadik',
      site: '@shalomtzadik',
      ...(imageUrl && { images: [imageUrl] }),
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
    other: {
      'theme-color': '#3b82f6',
      'msapplication-TileColor': '#3b82f6',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
      'application-name': siteName,
      'mobile-web-app-capable': 'yes',
    },
  };
}

export function getImageUrl(strapiImageUrl?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/';
  
  if (!strapiImageUrl) {
    return `${baseUrl.replace(/\/$/, '')}/api/og`;
  }
  
  if (strapiImageUrl.startsWith('http')) {
    return strapiImageUrl;
  }
  
  return `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL || ''}${strapiImageUrl}`;
} 

// Additional SEO utilities
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
} 