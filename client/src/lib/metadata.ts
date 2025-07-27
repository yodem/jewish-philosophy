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
    // Enhanced Twitter Card support
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@jewish_philosophy',
      site: '@jewish_philosophy',
      images: [imageUrl],
    },
    // Additional meta tags for better SEO
    other: {
      // Facebook specific meta tags
      'fb:app_id': '123456789', // Replace with actual Facebook App ID
      'article:publisher': 'https://www.facebook.com/jewish.philosophy',
      'article:author': 'שלום צדיק',
      // Additional SEO tags
      'theme-color': '#3b82f6',
      'msapplication-TileColor': '#3b82f6',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
      // Schema.org for rich snippets
      'application-name': siteName,
      'mobile-web-app-capable': 'yes',
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
    // Enhanced verification tags
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app';
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
        "url": `${baseUrl}/about`,
        "sameAs": [
          "https://www.facebook.com/jewish.philosophy",
          "https://www.youtube.com/c/jewish-philosophy",
          "https://www.instagram.com/jewish_philosophy",
          "https://www.linkedin.com/in/shalom-tzadik"
        ]
      }
    }),
    "publisher": {
      "@type": "Organization",
      "name": publisher?.name || siteName,
      "logo": {
        "@type": "ImageObject",
        "url": publisher?.logo || `${baseUrl}/logo.png`
      },
      "url": baseUrl,
      "sameAs": [
        "https://www.facebook.com/jewish.philosophy",
        "https://www.youtube.com/c/jewish-philosophy",
        "https://www.instagram.com/jewish_philosophy",
        "https://www.linkedin.com/company/jewish-philosophy"
      ]
    },
    ...(keywords && { "keywords": keywords }),
    "inLanguage": inLanguage,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    // Enhanced structured data for educational content
    "educationalUse": "instruction",
    "learningResourceType": type === 'Video' ? "lecture" : "educational material",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student"
    },
    ...additionalProperties
  };

  return baseStructure;
}

export function getImageUrl(strapiImageUrl?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app';
  
  if (!strapiImageUrl) {
    return `${baseUrl}/og-default.jpg`;
  }
  
  if (strapiImageUrl.startsWith('http')) {
    return strapiImageUrl;
  }
  
  return `${process.env.STRAPI_BASE_URL || ''}${strapiImageUrl}`;
} 

// Additional SEO utilities
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

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