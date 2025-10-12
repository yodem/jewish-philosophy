import './globals.css';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import { getGlobalSettings, getBanner } from "@/data/loaders";
import type { Banner as BannerType } from "@/types";
import { Suspense } from 'react';
import { Card } from "@/components/ui/card";
import Providers from './providers';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/next"
import { Metadata } from 'next';
import { JsonLd, Schema } from '@/lib/json-ld';
import LayoutClient from './LayoutClient';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { fredoka } from '@/lib/fonts';

export const metadata: Metadata = {
  title: {
    default: 'פילוסופיה יהודית | לימוד פילוסופיה יהודית מקוונת - שיעורי וידאו, הרמב"ם, הלכה ואגדה עם שלום צדיק',
    template: '%s | פילוסופיה יהודית - פלטפורמה ללימוד יהודי מקוון',
  },
  description: 'פלטפורמה מובילה ללימוד יהודי מקוון - שיעורי וידאו, ספרים, מאמרים ושאלות ותשובות בפילוסופיה יהודית. לימוד הרמב"ם, הלכה, אגדה, מוסר יהודי עם שלום צדיק. תכנים איכותיים בפילוסופיה דתית, יהדות רציונלית, ביקורת החילון.',
  keywords: ['פילוסופיה יהודית', 'פילוסופיה דתית', 'הרמב"ם', 'בחירה חופשית', 'ידיעת האל', 'השגחה', 'טעמי המצוות', 'מוסר הרמב"ם', 'דרך האמצע', 'נבל ברשות התורה', 'הוכחה לקיום האל', 'מהות האל', 'הכרחי המציאות', 'טרנסצנדנטיות האל', 'ביקורת החילון', 'יהדות רציונלית', 'דטרמיניזם', 'הגלגלים בפילוסופיה', 'מושגים בפילוסופיה יהודית', 'מבוא לפילוסופיה יהודית', 'על-טבעי ביהדות', 'חילון ליברלי', 'קיום מצוות', 'רוח החוק', 'סכלים נבדלים', 'אמת מהותית', 'השגה שכלית', 'תורה מן השמיים', 'הגדרת דת', 'הגדרת פילוסופיה', 'פילוסופיה דתית מתונה', 'פילוסופיה דתית רדיקלית', 'ספקות דתיות', 'אחדות האל', 'שכר ועונש', 'רבי יהודה הלוי', 'רבי סעדיה גאון', 'אריסטו', 'אבן רושד', 'מורה נבוכים', 'משנה תורה', 'שמונה פרקים', 'הלכות יסודי התורה', 'הלכות דעות', 'כוזרי', 'שלום צדיק', 'סדרות שיעורים', 'שיעורי וידאו', 'קורסים יהודיים', 'לימוד ברצף', 'הלכה', 'אגדה', 'מוסר יהודי', 'מחשבה יהודית', 'פלטפורמה יהודית', 'לימוד מקוון'],
  authors: [{ name: 'שלום צדיק' }],
  creator: 'שלום צדיק',
  publisher: 'שלום צדיק, יותם פרום',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'פילוסופיה יהודית | לימוד פילוסופיה יהודית מקוונת - שיעורי וידאו, הרמב"ם, הלכה ואגדה',
    description: 'פלטפורמה מובילה ללימוד יהודי מקוון - שיעורי וידאו, ספרים, מאמרים ושאלות ותשובות. תכנים איכותיים בפילוסופיה יהודית, הרמב"ם, הלכה, אגדה ומוסר יהודי עם שלום צדיק.',
    url: '/',
    siteName: 'פילוסופיה יהודית',
    locale: 'he_IL',
    type: 'website',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'פילוסופיה יהודית - פלטפורמה ללימוד פילוסופיה יהודית מקוונת עם שלום צדיק',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'פילוסופיה יהודית | לימוד פילוסופיה יהודית מקוונת',
    description: 'פלטפורמה מובילה ללימוד יהודי מקוון - שיעורי וידאו, הרמב"ם, הלכה ואגדה עם שלום צדיק',
    creator: '@jewish_philosophy',
    site: '@jewish_philosophy',
    images: ['/og-default.jpg'],
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
    'google-site-verification': 'Zq_s80KKBqFbAgDBh_VH4Ju2-viBuEf24eEZMC26BIs'
  },
  // Enhanced verification for immediate indexing
  verification: {
    google: 'Zq_s80KKBqFbAgDBh_VH4Ju2-viBuEf24eEZMC26BIs',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [globalRes, bannerRes] = await Promise.all([
    getGlobalSettings(),
    getBanner(),
  ]);
  
  const header = globalRes?.data?.header;
  const banner: BannerType | null = bannerRes?.data;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/';
  const logoUrl = `${siteUrl}logo.png`;

  const organizationSchema: Schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'פילוסופיה יהודית',
    alternateName: 'Jewish Philosophy Platform',
    url: siteUrl,
    logo: logoUrl,
    description: 'פלטפורמה מובילה ללימוד פילוסופיה יהודית מקוונת',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'שלום צדיק',
    },
    sameAs: [
      'https://www.facebook.com/jewish.philosophy',
      'https://www.youtube.com/c/jewish-philosophy',
      'https://www.instagram.com/jewish_philosophy',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IL',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Hebrew',
    },
  };

  const websiteSchema: Schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'פילוסופיה יהודית',
    url: siteUrl,
    description: 'פלטפורמה מובילה ללימוד פילוסופיה יהודית מקוונת',
    inLanguage: 'he-IL',
          potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}search?q={search_term_string}`,
        },
      },
  };

  return (
    <html lang="hebrew" dir="rtl" className={`overflow-x-hidden ${fredoka.className}`}>
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        {/* Google Tag Manager */}

        {/* End Google Tag Manager */}

        {/* Critical performance optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                
        {/* Force Google to crawl immediately */}
        <meta name="googlebot" content="index,follow,max-video-preview:-1,max-image-preview:large,max-snippet:-1" />
        {/* Preload critical resources */}
        <link rel="preload" href="/og-default.jpg" as="image" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.youtube.com" />
        <link rel="dns-prefetch" href="//i.ytimg.com" />
        
        {/* Preconnect to critical third parties */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Social media and manifest files */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Enhanced structured data for organization */}

      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-white flex flex-col overflow-x-hidden font-sans">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N78GTSCR"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        <Providers>
          <Suspense fallback={
            <nav className="w-full bg-gray-900 text-white py-4 px-8 flex items-center justify-between shadow-md">
              <div className="animate-pulse h-8 w-32 bg-gray-700 rounded" />
            </nav>
          }>
            <Navbar header={header} />
          </Suspense>

          {/* Banner below navbar - only show if banner exists and is active */}
          {banner && banner.isActive && (
            <Banner banner={banner} />
          )}

          <main className="container mx-auto px-1 sm:px-4 py-4 sm:py-8 flex flex-col align-center">
            <Card className="p-2 sm:p-6 bg-white/95 shadow-lg border-0 flex flex-col items-center overflow-hidden">
              {children}
            </Card>
          </main>

          {/* WhatsApp Floating Button */}
          <LayoutClient />
        </Providers>

        {/* Load analytics asynchronously */}
        <GoogleAnalytics gaId="G-72NSRCMH08" />
        <GoogleTagManager gtmId="GTM-N78GTSCR" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
