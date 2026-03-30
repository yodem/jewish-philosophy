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
  useRouteOgImage?: boolean;
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
    locale = 'he_IL',
    useRouteOgImage = false,
  } = seoData;

  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  // Only set image when caller passes a valid image URL; otherwise no og:image (same as /)
  const imageUrl =
    image !== undefined && image !== ''
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
      ...(!useRouteOgImage && imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : useRouteOgImage 
        ? {
            images: [
              {
                url: `${baseUrl.replace(/\/$/, '')}${url.startsWith('http') ? new URL(url).pathname : (url.startsWith('/') ? url : `/${url}`)}/opengraph-image`,
                width: 1200,
                height: 630,
                alt: title,
              }
            ]
          }
        : {
            images: [
              {
                url: `${baseUrl.replace(/\/$/, '')}/opengraph-image.png`,
                width: 512,
                height: 512,
                alt: siteName,
              }
            ]
          }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
      ...(tags && { tags }),
    },
    twitter: {
      card: useRouteOgImage || imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      creator: '@shalomtzadik',
      site: '@shalomtzadik',
      images: [imageUrl || `${baseUrl.replace(/\/$/, '')}/opengraph-image.png`],
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

export function getImageUrl(strapiImageUrl?: string): string | undefined {
  if (!strapiImageUrl) {
    return undefined;
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